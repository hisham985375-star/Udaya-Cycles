/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { getAdminSession } from "@/lib/auth/admin-auth";
import ImportProduct from "@/models/ImportProduct";

// GET /api/admin/bulk-import/[jobId]/products/[productId]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string; productId: string }> }
) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { jobId, productId } = await params;

    const product = await ImportProduct.findOne({ _id: productId, importJob: jobId })
      .populate("extractedBrand", "name slug")
      .populate("extractedCategory", "name slug")
      .populate("importFile", "originalName")
      .lean();

    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json({ product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/bulk-import/[jobId]/products/[productId] — edit single product
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ jobId: string; productId: string }> }
) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { jobId, productId } = await params;
    const body = await request.json();

    const {
      extractedName,
      extractedBrand,
      extractedBrandRaw,
      extractedCategory,
      extractedCategoryRaw,
      extractedSize,
      extractedSku,
      extractedDescription,
      extractedRegularPrice,
      status,
      reviewNotes,
      imageUrl,
      imagePublicId,
    } = body;

    const update: any = {};

    if (extractedName !== undefined) {
      update.extractedName = extractedName;
      update.nameNeedsReview = !extractedName || extractedName.trim().length === 0;
      update.nameConfidence = extractedName ? 100 : 0;
    }
    if (extractedBrand !== undefined) {
      update.extractedBrand = extractedBrand || null;
      update.extractedBrandRaw = extractedBrandRaw || null;
      update.brandNeedsReview = !extractedBrand;
      update.brandConfidence = extractedBrand ? 100 : 0;
    }
    if (extractedCategory !== undefined) {
      update.extractedCategory = extractedCategory || null;
      update.extractedCategoryRaw = extractedCategoryRaw || null;
      update.categoryNeedsReview = !extractedCategory;
      update.categoryConfidence = extractedCategory ? 100 : 0;
    }
    if (extractedSize !== undefined) {
      update.extractedSize = extractedSize || null;
      update.sizeNeedsReview = !extractedSize;
      update.sizeConfidence = extractedSize ? 100 : 0;
    }
    if (extractedSku !== undefined) update.extractedSku = extractedSku;
    if (extractedDescription !== undefined) update.extractedDescription = extractedDescription;
    if (extractedRegularPrice !== undefined) update.extractedRegularPrice = extractedRegularPrice;
    if (status !== undefined && ["READY", "NEEDS_REVIEW", "REJECTED"].includes(status)) {
      update.status = status;
    }
    if (reviewNotes !== undefined) update.reviewNotes = reviewNotes;

    // Image replacement
    if (imageUrl && imagePublicId) {
      update["image.cloudinaryUrl"] = imageUrl;
      update["image.cloudinaryPublicId"] = imagePublicId;
      update.imageNeedsReview = false;
      update.imageConfidence = 100;
    }

    const updated = await ImportProduct.findOneAndUpdate(
      { _id: productId, importJob: jobId },
      { $set: update },
      { new: true }
    )
      .populate("extractedBrand", "name slug")
      .populate("extractedCategory", "name slug")
      .lean();

    if (!updated) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
