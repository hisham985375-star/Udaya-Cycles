import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import ProductVariant from "@/models/ProductVariant";
import Product from "@/models/Product";
import { z } from "zod";

const createVariantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  color: z.string().min(1, "Color is required"),
  size: z.string().min(1, "Size is required"),
  priceAdjustment: z.number().default(0),
  stock: z.number().min(0).default(0),
  images: z.array(
    z.object({
      url: z.string(),
      publicId: z.string(),
      isPrimary: z.boolean().default(false),
    })
  ).min(1, "At least one image is required"),
  isActive: z.boolean().default(true),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const variants = await ProductVariant.find({ product: id }).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ variants });
  } catch (error) {
    console.error("[GET /api/admin/products/[id]/variants]", error);
    return NextResponse.json({ error: "Failed to fetch variants" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = createVariantSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    await connectDB();

    // Verify product exists
    const product = await Product.findOne({ _id: id, deletedAt: null });
    if (!product) {
      return NextResponse.json({ error: "Product not found or deleted" }, { status: 404 });
    }

    // Check SKU uniqueness
    const existingSku = await ProductVariant.findOne({ sku: parsed.data.sku });
    if (existingSku) {
      return NextResponse.json({ error: "A variant with this SKU already exists." }, { status: 409 });
    }

    const variant = await ProductVariant.create({
      ...parsed.data,
      product: id,
    });

    // Ensure product hasVariants flag is true
    if (!product.hasVariants) {
      await Product.findByIdAndUpdate(id, { hasVariants: true });
    }

    return NextResponse.json({ message: "Variant created", variant }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/products/[id]/variants]", error);
    return NextResponse.json({ error: "Failed to create variant" }, { status: 500 });
  }
}
