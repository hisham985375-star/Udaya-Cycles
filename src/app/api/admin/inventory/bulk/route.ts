/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Product from "@/models/Product";
import ProductVariant from "@/models/ProductVariant";
import { getAdminSession } from "@/lib/auth/admin-auth";

export async function GET() {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    // We fetch all products, and if they have variants, fetch those too.
    const products = await Product.find({ deletedAt: null }).select("name sku stock hasVariants regularPrice").lean();
    const variants = await ProductVariant.find().select("product sku stock regularPrice attributes").lean();
    
    // Group variants by product
    const variantMap: Record<string, any[]> = {};
    for (const v of variants) {
      const pid = String(v.product);
      if (!variantMap[pid]) variantMap[pid] = [];
      variantMap[pid].push(v);
    }

    const inventoryList = products.map(p => ({
      _id: String(p._id),
      name: p.name,
      sku: p.sku,
      hasVariants: p.hasVariants,
      stock: p.stock,
      price: p.regularPrice,
      isVariant: false,
      variants: p.hasVariants ? (variantMap[String(p._id)] || []).map(v => ({
        _id: String(v._id),
        name: Object.values(v.attributes).join(" / "),
        sku: v.sku,
        stock: v.stock,
        price: v.regularPrice,
        isVariant: true
      })) : []
    }));

    return NextResponse.json({ inventory: inventoryList });
  } catch (error) {
    console.error("[GET_INVENTORY]", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { updates } = await request.json();
    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    await connectDB();

    for (const update of updates) {
      if (update.isVariant) {
        await ProductVariant.findByIdAndUpdate(update._id, { stock: update.stock });
      } else {
        await Product.findByIdAndUpdate(update._id, { stock: update.stock });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PUT_INVENTORY]", error);
    return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
  }
}
