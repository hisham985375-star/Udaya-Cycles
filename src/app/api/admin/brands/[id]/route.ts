import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Brand from "@/models/Brand";
import { generateSlug } from "@/lib/utils/helpers";
import { z } from "zod";

const updateBrandSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  logo: z.object({
    url: z.string(),
    publicId: z.string(),
  }).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const brand = await Brand.findById(id).lean();

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ brand });
  } catch (error) {
    console.error("[GET /api/admin/brands/[id]]", error);
    return NextResponse.json({ error: "Failed to fetch brand" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateBrandSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    await connectDB();

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (updateData.name) {
      updateData.slug = generateSlug(updateData.name as string);
      const existing = await Brand.findOne({ slug: updateData.slug, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ error: "Another brand with this name/slug already exists." }, { status: 409 });
      }
    }

    const brand = await Brand.findByIdAndUpdate(id, updateData, { new: true });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Brand updated", brand });
  } catch (error) {
    console.error("[PUT /api/admin/brands/[id]]", error);
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    
    // Check if brand is used in any products
    
    const brand = await Brand.findByIdAndDelete(id);

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Brand deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/admin/brands/[id]]", error);
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}
