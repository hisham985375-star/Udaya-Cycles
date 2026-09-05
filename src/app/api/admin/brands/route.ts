import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Brand from "@/models/Brand";
import { generateSlug } from "@/lib/utils/helpers";
import { z } from "zod";

const createBrandSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  logo: z.object({
    url: z.string(),
    publicId: z.string(),
  }).optional(),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    await connectDB();
    const brands = await Brand.find().sort({ name: 1 }).lean();
    return NextResponse.json({ brands });
  } catch (error) {
    console.error("[GET /api/admin/brands]", error);
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createBrandSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    await connectDB();
    const slug = generateSlug(parsed.data.name);

    const existing = await Brand.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: "A brand with this name/slug already exists." }, { status: 409 });
    }

    const brand = await Brand.create({
      ...parsed.data,
      slug,
    });

    return NextResponse.json({ message: "Brand created", brand }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/brands]", error);
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
  }
}
