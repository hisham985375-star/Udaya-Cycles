/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Product from "@/models/Product";
import ProductVariant from "@/models/ProductVariant";
import { getAdminSession } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/audit";
import slugify from "slugify";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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
      variants,
      isNewArrival,
      newArrivalOrder
    } = body;

    await connectDB();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check SKU conflict
    if (sku !== product.sku) {
      const existingSku = await Product.findOne({ sku });
      if (existingSku) {
        return NextResponse.json({ error: "Product with this SKU already exists" }, { status: 400 });
      }
    }

    // Update base fields
    if (name !== product.name) {
      product.name = name;
      product.slug = slugify(name, { lower: true, strict: true }) + '-' + Math.floor(Math.random() * 10000).toString();
    }
    
    const originalProduct = product.toObject();

    product.name = name;
    product.sku = sku;
    product.type = type;
    product.category = category || undefined;
    product.brand = brand || undefined;
    product.description = description;
    product.size = size || undefined;
    product.regularPrice = regularPrice;
    product.salePrice = salePrice || undefined;
    product.stock = hasVariants ? 0 : (stock || 0);
    product.images = images || [];
    product.specifications = specifications || [];
    product.hasVariants = !!hasVariants;
    product.variantAttributes = variantAttributes || [];
    product.isNewArrival = !!isNewArrival;
    product.newArrivalOrder = parseInt(newArrivalOrder) || 0;

    await product.save();

    // Handle Variants (Wipe and recreate for simplicity in MVP)
    await ProductVariant.deleteMany({ product: product._id });

    if (hasVariants && variants && variants.length > 0) {
      const variantDocs = variants.map((v: any) => ({
        product: product._id,
        attributes: v.attributes,
        sku: v.sku,
        regularPrice: v.regularPrice,
        salePrice: v.salePrice || undefined,
        stock: v.stock || 0,
        image: v.image || undefined
      }));
      
      await ProductVariant.insertMany(variantDocs);
    }

    await logAdminAction({
      action: "UPDATE_PRODUCT",
      entity: "Product",
      entityId: product._id.toString(),
      before: { name: originalProduct.name, regularPrice: originalProduct.regularPrice },
      after: { name: product.name, regularPrice: product.regularPrice }
    });

    return NextResponse.json({ success: true, product });

  } catch (error: any) {
    console.error("[UPDATE_PRODUCT_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();
    
    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Soft delete
    product.deletedAt = new Date();
    product.isActive = false;
    await product.save();

    await logAdminAction({
      action: "DELETE_PRODUCT",
      entity: "Product",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[DELETE_PRODUCT_ERROR]", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
