/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { getAdminSession } from "@/lib/auth/admin-auth";
import ImportProduct from "@/models/ImportProduct";
import ImportJob from "@/models/ImportJob";

// GET /api/admin/bulk-import/[jobId]/products
export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { jobId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const filter: any = { importJob: jobId };
    if (status !== "all") {
      filter.status = status.toUpperCase();
    }
    if (search) {
      filter.$or = [
        { extractedName: { $regex: search, $options: "i" } },
        { extractedBrandRaw: { $regex: search, $options: "i" } },
        { extractedCategoryRaw: { $regex: search, $options: "i" } },
      ];
    }

    const [products, total] = await Promise.all([
      ImportProduct.find(filter)
        .populate("extractedBrand", "name")
        .populate("extractedCategory", "name")
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ImportProduct.countDocuments(filter),
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
  } catch (error: any) {
    console.error("[GET /api/admin/bulk-import/[jobId]/products]", error);
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 });
  }
}

// PATCH /api/admin/bulk-import/[jobId]/products — bulk actions
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { jobId } = await params;
    const body = await request.json();
    const { productIds, action, value } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "No product IDs provided" }, { status: 400 });
    }

    // Ensure all products belong to this job
    const filter: any = { _id: { $in: productIds }, importJob: jobId };

    let updateDoc: any = {};
    let updateCount = 0;

    switch (action) {
      case "change_brand":
        updateDoc = {
          extractedBrand: value.brandId || null,
          extractedBrandRaw: value.brandName || null,
          brandNeedsReview: false,
          brandConfidence: 100,
        };
        break;

      case "change_category":
        updateDoc = {
          extractedCategory: value.categoryId || null,
          extractedCategoryRaw: value.categoryName || null,
          categoryNeedsReview: false,
          categoryConfidence: 100,
        };
        break;

      case "change_status":
        if (!["READY", "NEEDS_REVIEW", "REJECTED"].includes(value.status)) {
          return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }
        updateDoc = { status: value.status };
        break;

      case "approve":
        // Only approve READY products
        filter.status = "READY";
        updateDoc = { status: "APPROVED" };
        break;

      case "reject":
        updateDoc = { status: "REJECTED" };
        break;

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    const result = await ImportProduct.updateMany(filter, { $set: updateDoc });
    updateCount = result.modifiedCount;

    // Recalculate job stats
    await recalculateJobStats(jobId);

    return NextResponse.json({ success: true, updatedCount: updateCount });
  } catch (error: any) {
    console.error("[PATCH /api/admin/bulk-import/[jobId]/products]", error);
    return NextResponse.json({ error: error.message || "Bulk action failed" }, { status: 500 });
  }
}

async function recalculateJobStats(jobId: string) {
  const [ready, needsReview, failed, approved, rejected] = await Promise.all([
    ImportProduct.countDocuments({ importJob: jobId, status: "READY" }),
    ImportProduct.countDocuments({ importJob: jobId, status: "NEEDS_REVIEW" }),
    ImportProduct.countDocuments({ importJob: jobId, status: "FAILED" }),
    ImportProduct.countDocuments({ importJob: jobId, status: "APPROVED" }),
    ImportProduct.countDocuments({ importJob: jobId, status: "REJECTED" }),
  ]);

  const total = ready + needsReview + failed + approved + rejected;

  await ImportJob.findByIdAndUpdate(jobId, {
    totalProducts: total,
    readyProducts: ready,
    needsReviewProducts: needsReview,
    failedProducts: failed,
    approvedProducts: approved,
    rejectedProducts: rejected,
  });
}
