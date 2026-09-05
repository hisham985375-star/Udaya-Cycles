import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import { getPaginationParams } from "@/lib/utils/helpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const categorySlug = searchParams.get("category");
    const brandSlug = searchParams.get("brand");
    const type = searchParams.get("type") as "cycle" | "accessory" | null;
    const availability = searchParams.get("availability"); // "in-stock" | "out-of-stock"
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sort") ?? "newest";
    const search = searchParams.get("q");
    const { page, skip, limit } = getPaginationParams(
      searchParams.get("page"),
      searchParams.get("limit")
    );

    await connectDB();

    // Build query
    const query: Record<string, unknown> = { isActive: true };

    // Category filter
    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug, isActive: true }).lean();
      if (!category) {
        return NextResponse.json({ products: [], total: 0, page, limit });
      }
      query["category"] = category._id;
    }

    // Brand filter
    if (brandSlug) {
      const brand = await Brand.findOne({ slug: brandSlug, isActive: true }).lean();
      if (!brand) {
        return NextResponse.json({ products: [], total: 0, page, limit });
      }
      query["brand"] = brand._id;
    }

    // Product type
    if (type) query["type"] = type;

    // Availability filter
    if (availability === "in-stock") {
      query["stock"] = { $gt: 0 };
    } else if (availability === "out-of-stock") {
      query["stock"] = { $lte: 0 };
    }

    // Price filter (in paise)
    if (minPrice || maxPrice) {
      const priceQuery: Record<string, number> = {};
      if (minPrice) priceQuery["$gte"] = parseInt(minPrice, 10);
      if (maxPrice) priceQuery["$lte"] = parseInt(maxPrice, 10);
      query["regularPrice"] = priceQuery;
    }

    // Text search
    if (search) {
      query["$text"] = { $search: search };
    }

    // Sort options
    let sortOption: Record<string, 1 | -1> = {};
    switch (sortBy) {
      case "price-asc":
        sortOption = { regularPrice: 1 };
        break;
      case "price-desc":
        sortOption = { regularPrice: -1 };
        break;
      case "name-asc":
        sortOption = { name: 1 };
        break;
      case "rating":
        sortOption = { averageRating: -1, reviewCount: -1 };
        break;
      default: // newest
        sortOption = { createdAt: -1 };
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("brand", "name slug")
        .populate("category", "name slug")
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .select(
          "name slug images regularPrice salePrice stock isNewArrival isFeatured averageRating reviewCount brand category type"
        )
        .lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json({ error: "Failed to fetch products." }, { status: 500 });
  }
}
