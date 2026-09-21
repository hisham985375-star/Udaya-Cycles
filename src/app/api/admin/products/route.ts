/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Product from "@/models/Product";
import ProductVariant from "@/models/ProductVariant";
import Category from "@/models/Category";
import mongoose from "mongoose";
import { getAdminSession } from "@/lib/auth/admin-auth";
import slugify from "slugify";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type");

    await connectDB();

    const query: Record<string, unknown> = { deletedAt: null };
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("brand", "name")
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/products]", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      name, 
      type, 
      category, 
      brand, 
      regularPrice, 
      salePrice, 
      stock, 
      sku, 
      images, 
      description,
      size,
      specifications,
      hasVariants,
      variantAttributes,
      variants, // array of variant objects to create
      isNewArrival,
      newArrivalOrder
    } = body;

    if (!name || !sku || regularPrice === undefined || regularPrice === null || Number.isNaN(regularPrice)) {
      return NextResponse.json({ error: "Name, SKU, and Base Price are required" }, { status: 400 });
    }

    await connectDB();

    const baseSlug = slugify(name, { lower: true, strict: true });
    
    // Check if sku exists
    const existingSku = await Product.findOne({ sku });
    if (existingSku) {
      return NextResponse.json({ error: "Product with this SKU already exists" }, { status: 400 });
    }
    
    // Auto-generate unique slug
    let slug = baseSlug;
    let counter = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    let finalCategoryId = category;
    if (category && !mongoose.Types.ObjectId.isValid(category)) {
      // It's a new category string
      const catSlug = slugify(category, { lower: true, strict: true });
      let existingCat = await Category.findOne({ slug: catSlug });
      if (!existingCat) {
        existingCat = await Category.create({ name: category, slug: catSlug });
      }
      finalCategoryId = existingCat._id;
    }

    const newProduct = new Product({
      name,
      slug,
      sku,
      type,
      category: finalCategoryId || undefined,
      brand: brand || undefined,
      description,
      size: size || undefined,
      regularPrice,
      salePrice: salePrice || undefined,
      stock: hasVariants ? 0 : (stock || 0),
      images: images || [],
      specifications: specifications || [],
      hasVariants: !!hasVariants,
      variantAttributes: variantAttributes || [],
      isNewArrival: !!isNewArrival,
      newArrivalOrder: parseInt(newArrivalOrder) || 0
    });

    await newProduct.save();

    if (hasVariants && variants && variants.length > 0) {
      const variantDocs = variants.map((v: any) => ({
        product: newProduct._id,
        attributes: v.attributes,
        sku: v.sku,
        regularPrice: v.regularPrice,
        salePrice: v.salePrice || undefined,
        stock: v.stock || 0,
        image: v.image || undefined
      }));
      
      await ProductVariant.insertMany(variantDocs);
    }

    return NextResponse.json({ success: true, product: newProduct });

  } catch (error: any) {
    console.error("[CREATE_PRODUCT_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") || "";
    const brandId = searchParams.get("brand");
    const categoryId = searchParams.get("category");
    const size = searchParams.get("size");
    const minPriceStr = searchParams.get("minPrice");
    const maxPriceStr = searchParams.get("maxPrice");

    await connectDB();

    const query: Record<string, any> = { deletedAt: null };
    
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (brandId) {
      query.brand = brandId;
    }
    if (categoryId) {
      query.category = categoryId;
    }
    if (size) {
      query.size = size;
    }
    
    if (minPriceStr || maxPriceStr) {
      query.regularPrice = {};
      if (minPriceStr) query.regularPrice.$gte = parseInt(minPriceStr) * 100;
      if (maxPriceStr) query.regularPrice.$lte = parseInt(maxPriceStr) * 100;
    }

    // Find all products matching the query to delete their variants
    const productsToDelete = await Product.find(query).select("_id");
    const productIds = productsToDelete.map((p) => p._id);

    if (productIds.length > 0) {
      await ProductVariant.deleteMany({ product: { $in: productIds } });
      await Product.deleteMany(query);
    }

    return NextResponse.json({ success: true, count: productIds.length });
  } catch (error) {
    console.error("[DELETE /api/admin/products]", error);
    return NextResponse.json({ error: "Failed to bulk delete products" }, { status: 500 });
  }
}

