import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import Brand from "@/models/Brand";

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true }).select("name slug").lean();
    const brands = await Brand.find({ isActive: true }).select("name slug").lean();
    
    return NextResponse.json({ categories, brands });
  } catch (error) {
    console.error("[GET_METADATA_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 });
  }
}
