import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay credentials are not configured on the server" },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { amount, currency = "INR", receipt } = body;

    // Validate amount
    if (!amount || typeof amount !== "number" || amount < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 100 paise (₹1.00)" },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(amount),
      currency: currency.toUpperCase(),
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || keyId,
    });
  } catch (error: any) {
    console.error("[RAZORPAY_CREATE_ORDER_ERROR]", error);

    // Authentication failure with Razorpay
    if (
      error.statusCode === 401 ||
      (error.error && error.error.code === "BAD_REQUEST_ERROR" && error.error.description?.includes("auth"))
    ) {
      return NextResponse.json({ error: "Razorpay authentication failed" }, { status: 401 });
    }

    return NextResponse.json(
      { error: error?.error?.description || error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
