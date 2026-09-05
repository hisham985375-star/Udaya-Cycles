import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Product from "@/models/Product";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ products: [] });
    }

    await connectDB();

    // Simple regex search on name and description
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
      isActive: true,
      deletedAt: null
    })
      .select("name slug basePrice images")
      .limit(6)
      .lean();

    return NextResponse.json({ products });
  } catch (error) {
    console.error("[SEARCH_ERROR]", error);
    return NextResponse.json({ error: "Failed to search products" }, { status: 500 });
  }
}
