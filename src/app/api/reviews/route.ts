import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Review from "@/models/Review";
import { auth } from "@/lib/auth/auth";

// Get reviews for a product
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    await connectDB();
    
    const reviews = await Review.find({ product: productId, status: "approved" })
      .populate("user", "firstName lastName")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error("[REVIEWS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Post a review
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "You must be logged in to leave a review." }, { status: 401 });
    }

    const { productId, rating, title, body } = await request.json();

    if (!productId || !rating || !body) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // Create the review
    const newReview = await Review.create({
      product: productId,
      user: session.user.id,
      rating,
      title,
      body,
      status: "approved", // Auto-approving for the sake of demo, normally 'pending'
    });

    return NextResponse.json({ success: true, review: newReview });
  } catch (error: any) {
    console.error("[REVIEWS_POST_ERROR]", error);
    if (error.code === 11000) {
       return NextResponse.json({ error: "You have already reviewed this product." }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
