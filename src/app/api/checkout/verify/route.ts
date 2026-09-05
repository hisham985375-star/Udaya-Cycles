/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db/mongoose";
import Order from "@/models/Order";
import { sendEmail } from "@/lib/mail/mailer";
import { getOrderConfirmationEmail } from "@/lib/mail/templates";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      console.error("RAZORPAY_KEY_SECRET is not defined");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Verify signature
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Update order status in DB
    await connectDB();
    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { 
        paymentStatus: "paid",
        status: "order_confirmed",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.customerDetails?.email) {
      sendEmail({
        to: order.customerDetails.email,
        subject: `Order Confirmation - Udaya Cycles (#${order.orderNumber})`,
        html: getOrderConfirmationEmail(order._id.toString(), order.total, order.customerDetails.firstName)
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, orderNumber: order.orderNumber });
  } catch (error: any) {
    console.error("[RAZORPAY_VERIFY_ERROR]", error);
    return NextResponse.json({ error: error.message || "Payment verification failed" }, { status: 500 });
  }
}
