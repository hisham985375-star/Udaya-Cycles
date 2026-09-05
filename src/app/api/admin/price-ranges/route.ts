import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import PriceRange from "@/models/PriceRange";
import { generateSlug } from "@/lib/utils/helpers";
import { z } from "zod";

const createPriceRangeSchema = z.object({
  label: z.string().min(1, "Label is required"),
  minPrice: z.number().min(0),
  maxPrice: z.number().nullable().optional(),
  sortOrder: z.number().default(0),
});

export async function GET() {
  try {
    await connectDB();
    const ranges = await PriceRange.find().sort({ sortOrder: 1, minPrice: 1 }).lean();
    return NextResponse.json({ ranges });
  } catch (error) {
    console.error("[GET /api/admin/price-ranges]", error);
    return NextResponse.json({ error: "Failed to fetch price ranges" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createPriceRangeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    await connectDB();
    const slug = generateSlug(parsed.data.label);

    const existing = await PriceRange.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: "A price range with this label/slug already exists." }, { status: 409 });
    }

    const range = await PriceRange.create({
      ...parsed.data,
      slug,
    });

    return NextResponse.json({ message: "Price range created", range }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/price-ranges]", error);
    return NextResponse.json({ error: "Failed to create price range" }, { status: 500 });
  }
}
