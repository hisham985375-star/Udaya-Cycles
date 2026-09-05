import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import AccessoryCategory from "@/models/AccessoryCategory";
import { generateSlug } from "@/lib/utils/helpers";
import { z } from "zod";

const createAccessoryCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  image: z.object({
    url: z.string(),
    publicId: z.string(),
  }).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export async function GET() {
  try {
    await connectDB();
    const categories = await AccessoryCategory.find().sort({ sortOrder: 1, name: 1 }).lean();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("[GET /api/admin/accessory-categories]", error);
    return NextResponse.json({ error: "Failed to fetch accessory categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createAccessoryCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    await connectDB();
    const slug = generateSlug(parsed.data.name);

    const existing = await AccessoryCategory.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: "An accessory category with this name/slug already exists." }, { status: 409 });
    }

    const category = await AccessoryCategory.create({
      ...parsed.data,
      slug,
    });

    return NextResponse.json({ message: "Accessory category created", category }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/accessory-categories]", error);
    return NextResponse.json({ error: "Failed to create accessory category" }, { status: 500 });
  }
}
