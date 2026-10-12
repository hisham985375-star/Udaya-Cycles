import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json(
        { error: "Server configuration error: Razorpay secret not set" },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    
    // Support both naming conventions
    const orderId = body.razorpay_order_id || body.order_id;
    const paymentId = body.razorpay_payment_id || body.payment_id;
    const signature = body.razorpay_signature || body.signature;

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "Missing required fields: order_id, payment_id, and signature are required" },
        { status: 400 }
      );
    }

    // Generate HMAC-SHA256 signature
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (generatedSignature !== signature) {
      return NextResponse.json(
        { error: "Invalid payment signature verification failed", success: false },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      order_id: orderId,
      payment_id: paymentId,
    });
  } catch (error: any) {
    console.error("[RAZORPAY_VERIFY_PAYMENT_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed", success: false },
      { status: 500 }
    );
  }
}
