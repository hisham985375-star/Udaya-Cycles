import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Brand from "@/models/Brand";

export async function GET() {
  try {
    await connectDB();
    const brands = await Brand.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select("name slug description logo coverImage sortOrder")
      .lean();

    return NextResponse.json({ brands });
  } catch (error) {
    console.error("[GET /api/brands]", error);
    return NextResponse.json({ error: "Failed to fetch brands." }, { status: 500 });
  }
}
