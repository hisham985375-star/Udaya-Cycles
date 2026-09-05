import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import ProductVariant from "@/models/ProductVariant";
import { z } from "zod";

const updateVariantSchema = z.object({
  sku: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  size: z.string().min(1).optional(),
  priceAdjustment: z.number().optional(),
  stock: z.number().min(0).optional(),
  images: z.array(
    z.object({
      url: z.string(),
      publicId: z.string(),
      isPrimary: z.boolean().default(false),
    })
  ).optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const { variantId } = await params;
    const body = await request.json();
    const parsed = updateVariantSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    await connectDB();

    if (parsed.data.sku) {
      const existingSku = await ProductVariant.findOne({ sku: parsed.data.sku, _id: { $ne: variantId } });
      if (existingSku) {
        return NextResponse.json({ error: "Another variant with this SKU already exists." }, { status: 409 });
      }
    }

    const variant = await ProductVariant.findByIdAndUpdate(
      variantId,
      { ...parsed.data },
      { new: true }
    );

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Variant updated", variant });
  } catch (error) {
    console.error("[PUT /api/admin/products/[id]/variants/[variantId]]", error);
    return NextResponse.json({ error: "Failed to update variant" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const { variantId } = await params;
    await connectDB();
    
    // Instead of hard delete, set isActive to false
    const variant = await ProductVariant.findByIdAndUpdate(
      variantId,
      { isActive: false },
      { new: true }
    );

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Variant deactivated successfully" });
  } catch (error) {
    console.error("[DELETE /api/admin/products/[id]/variants/[variantId]]", error);
    return NextResponse.json({ error: "Failed to delete variant" }, { status: 500 });
  }
}
