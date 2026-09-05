/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Order from "@/models/Order";
import { getAdminSession } from "@/lib/auth/admin-auth";
import { sendEmail } from "@/lib/mail/mailer";
import { getOrderStatusUpdateEmail } from "@/lib/mail/templates";

export async function POST(request: Request) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, status, paymentStatus, trackingNumber, trackingUrl, courierPartner } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only log history if status actually changed
    const originalStatus = order.status;
    if (originalStatus !== status) {
      order.statusHistory.push({
        status,
        note: `Status updated by Admin`,
        updatedBy: adminSession.id as any,
        timestamp: new Date()
      });
    }

    order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (trackingUrl !== undefined) order.trackingUrl = trackingUrl;
    if (courierPartner !== undefined) order.courierPartner = courierPartner;

    await order.save();

    // Trigger email if status changed and email exists
    if (originalStatus !== status && order.customerDetails?.email) {
      if (["processing", "shipped", "delivered", "cancelled"].includes(status)) {
        sendEmail({
          to: order.customerDetails.email,
          subject: `Order Update - Udaya Cycles (#${order.orderNumber})`,
          html: getOrderStatusUpdateEmail(order._id.toString(), status, trackingNumber)
        }).catch(console.error);
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("[UPDATE_ORDER_STATUS_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to update order status" }, { status: 500 });
  }
}
