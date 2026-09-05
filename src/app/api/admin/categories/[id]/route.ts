import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import { generateSlug } from "@/lib/utils/helpers";
import { z } from "zod";

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  image: z.object({
    url: z.string(),
    publicId: z.string(),
  }).optional(),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
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
    const category = await Category.findById(id).lean();

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("[GET /api/admin/categories/[id]]", error);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    await connectDB();

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (updateData.name) {
      updateData.slug = generateSlug(updateData.name as string);
      const existing = await Category.findOne({ slug: updateData.slug, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ error: "Another category with this name/slug already exists." }, { status: 409 });
      }
    }

    const category = await Category.findByIdAndUpdate(id, updateData, { new: true });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category updated", category });
  } catch (error) {
    console.error("[PUT /api/admin/categories/[id]]", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    
    // Check if category is used in any products
    // (We would ideally check Product model here before deletion)
    
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/admin/categories/[id]]", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
