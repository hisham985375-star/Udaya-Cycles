/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Order from "@/models/Order";
import Razorpay from "razorpay";
import { auth } from "@/lib/auth/auth";
import { sendEmail } from "@/lib/mail/mailer";
import { getOrderConfirmationEmail } from "@/lib/mail/templates";

export async function POST(request: Request) {
  try {
    const session = await auth();
    // For MVP, we will allow guest checkout if session is null, but we need an email
    
    const body = await request.json();
    const { items, shippingAddress, paymentMethod, subtotal, shippingFee, discount, customerDetails } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    await connectDB();

    const total = subtotal + shippingFee - discount;

    // Generate Order Number
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `ORD-${timestamp}-${random}`;

    // Create pending order in DB
    const newOrder = await Order.create({
      orderNumber,
      user: session?.user?.id || null, // Allow null for guests for now, though schema requires it. Wait! Schema requires user.
      customerDetails: {
        firstName: customerDetails.firstName,
        lastName: customerDetails.lastName,
        email: customerDetails.email,
        phone: customerDetails.phone,
      },
      shippingAddress,
      items: items.map((item: any) => ({
        product: item.productId,
        variant: item.variantId,
        productSnapshot: {
          name: item.name,
          sku: item.sku,
          image: item.image,
          attributes: item.attributes,
        },
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
      })),
      subtotal,
      shippingFee,
      discount,
      total,
      paymentMethod,
      paymentStatus: "pending",
      status: paymentMethod === "razorpay" ? "payment_pending" : "order_confirmed",
    });

    if (paymentMethod === "razorpay") {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || "",
        key_secret: process.env.RAZORPAY_KEY_SECRET || "",
      });

      const options = {
        amount: total, // amount in the smallest currency unit (paise)
        currency: "INR",
        receipt: orderNumber,
      };

      const rzpOrder = await razorpay.orders.create(options);

      // Save razorpayOrderId to the DB
      newOrder.razorpayOrderId = rzpOrder.id;
      await newOrder.save();

      return NextResponse.json({
        success: true,
        orderId: newOrder._id,
        orderNumber: newOrder.orderNumber,
        razorpayOrderId: rzpOrder.id,
        amount: total,
      });
    } else {
      // COD
      if (customerDetails.email) {
        sendEmail({
          to: customerDetails.email,
          subject: `Order Confirmation - Udaya Cycles (#${orderNumber})`,
          html: getOrderConfirmationEmail(newOrder._id.toString(), total, customerDetails.firstName)
        }).catch(console.error);
      }

      return NextResponse.json({
        success: true,
        orderId: newOrder._id,
        orderNumber: newOrder.orderNumber,
      });
    }

  } catch (error: any) {
    console.error("[CREATE_ORDER_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
