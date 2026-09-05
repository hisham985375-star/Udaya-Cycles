import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import { generateSlug } from "@/lib/utils/helpers";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
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
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ sortOrder: 1, name: 1 }).lean();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("[GET /api/admin/categories]", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    await connectDB();
    const slug = generateSlug(parsed.data.name);

    // Check if slug exists
    const existing = await Category.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: "A category with this name/slug already exists." }, { status: 409 });
    }

    const category = await Category.create({
      ...parsed.data,
      slug,
    });

    return NextResponse.json({ message: "Category created", category }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/categories]", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
