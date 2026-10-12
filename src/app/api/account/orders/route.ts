import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoose";
import Order from "@/models/Order";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber");

    await connectDB();

    // If specific order number requested for this customer
    if (orderNumber) {
      const order = await Order.findOne({
        orderNumber,
        $or: [
          ...(session.user.id ? [{ user: session.user.id }] : []),
          ...(session.user.email ? [{ "customerDetails.email": session.user.email }] : []),
        ],
      }).lean();

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      return NextResponse.json({ order });
    }

    // Fetch all completed/relevant customer orders
    const queryConditions: any[] = [];
    if (session.user.id) {
      queryConditions.push({ user: session.user.id });
    }
    if (session.user.email) {
      queryConditions.push({ "customerDetails.email": session.user.email });
    }

    if (queryConditions.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    const orders = await Order.find({
      $or: queryConditions,
      // Include all valid orders (exclude abandoned payment_pending if razorpay)
      $nor: [{ paymentMethod: "razorpay", paymentStatus: "pending", status: "payment_pending" }],
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("[ACCOUNT_ORDERS_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
