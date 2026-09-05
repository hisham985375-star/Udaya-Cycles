import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import AccessoryCategory from "@/models/AccessoryCategory";
import { generateSlug } from "@/lib/utils/helpers";
import { z } from "zod";

const updateAccessoryCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  image: z.object({
    url: z.string(),
    publicId: z.string(),
  }).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const category = await AccessoryCategory.findById(id).lean();

    if (!category) {
      return NextResponse.json({ error: "Accessory category not found" }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("[GET /api/admin/accessory-categories/[id]]", error);
    return NextResponse.json({ error: "Failed to fetch accessory category" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateAccessoryCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    await connectDB();

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (updateData.name) {
      updateData.slug = generateSlug(updateData.name as string);
      const existing = await AccessoryCategory.findOne({ slug: updateData.slug, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ error: "Another category with this name/slug already exists." }, { status: 409 });
      }
    }

    const category = await AccessoryCategory.findByIdAndUpdate(id, updateData, { new: true });

    if (!category) {
      return NextResponse.json({ error: "Accessory category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Accessory category updated", category });
  } catch (error) {
    console.error("[PUT /api/admin/accessory-categories/[id]]", error);
    return NextResponse.json({ error: "Failed to update accessory category" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    
    const category = await AccessoryCategory.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json({ error: "Accessory category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Accessory category deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/admin/accessory-categories/[id]]", error);
    return NextResponse.json({ error: "Failed to delete accessory category" }, { status: 500 });
  }
}
