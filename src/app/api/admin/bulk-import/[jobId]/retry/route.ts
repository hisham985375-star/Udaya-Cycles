/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { getAdminSession } from "@/lib/auth/admin-auth";
import ImportJob from "@/models/ImportJob";
import ImportProduct from "@/models/ImportProduct";
import { processImportJob } from "@/lib/import/job-processor";

// POST /api/admin/bulk-import/[jobId]/retry
// Retries FAILED products by re-triggering job processing for failed files
export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { jobId } = await params;

    const job = await ImportJob.findById(jobId);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    if (job.status === "PROCESSING") {
      return NextResponse.json({ error: "Job is already processing" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { productIds } = body;

    // Reset specific FAILED products to PROCESSING so they can be retried
    const filter: any = {
      importJob: jobId,
      status: "FAILED",
    };

    if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      filter._id = { $in: productIds };
    }

    const failedCount = await ImportProduct.countDocuments(filter);
    if (failedCount === 0) {
      return NextResponse.json({ error: "No failed products to retry" }, { status: 400 });
    }

    // Reset job status
    job.status = "QUEUED";
    await job.save();

    // Delete failed ImportProduct records so they get re-created
    await ImportProduct.deleteMany(filter);

    // Re-trigger processing
    processImportJob(jobId).catch((err) => {
      console.error(`[RETRY] Job ${jobId} retry failed:`, err);
    });

    return NextResponse.json({ success: true, retriedCount: failedCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
