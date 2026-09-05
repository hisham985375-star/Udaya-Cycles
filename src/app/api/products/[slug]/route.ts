import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Product from "@/models/Product";
import ProductVariant from "@/models/ProductVariant";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();

    const product = await Product.findOne({ slug, isActive: true })
      .populate("brand", "name slug logo")
      .populate("category", "name slug")
      .populate("accessoryCategory", "name slug")
      .lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    // Fetch variants if product has them
    let variants: unknown[] = [];
    if (product.hasVariants) {
      variants = await ProductVariant.find({ product: product._id, isActive: true })
        .sort({ createdAt: 1 })
        .lean();
    }

    return NextResponse.json({ product, variants });
  } catch (error) {
    console.error("[GET /api/products/[slug]]", error);
    return NextResponse.json({ error: "Failed to fetch product." }, { status: 500 });
  }
}
