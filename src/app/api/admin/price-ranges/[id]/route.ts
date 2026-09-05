import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import PriceRange from "@/models/PriceRange";
import { generateSlug } from "@/lib/utils/helpers";
import { z } from "zod";

const updatePriceRangeSchema = z.object({
  label: z.string().min(1).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().nullable().optional(),
  sortOrder: z.number().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updatePriceRangeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    await connectDB();

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (updateData.label) {
      updateData.slug = generateSlug(updateData.label as string);
      const existing = await PriceRange.findOne({ slug: updateData.slug, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ error: "Another price range with this label/slug already exists." }, { status: 409 });
      }
    }

    const range = await PriceRange.findByIdAndUpdate(id, updateData, { new: true });

    if (!range) {
      return NextResponse.json({ error: "Price range not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Price range updated", range });
  } catch (error) {
    console.error("[PUT /api/admin/price-ranges/[id]]", error);
    return NextResponse.json({ error: "Failed to update price range" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    
    const range = await PriceRange.findByIdAndDelete(id);

    if (!range) {
      return NextResponse.json({ error: "Price range not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Price range deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/admin/price-ranges/[id]]", error);
    return NextResponse.json({ error: "Failed to delete price range" }, { status: 500 });
  }
}
