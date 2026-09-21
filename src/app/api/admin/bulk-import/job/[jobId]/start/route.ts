import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { getAdminSession } from "@/lib/auth/admin-auth";
import { processImportJob } from "@/lib/import/job-processor";
import ImportJob from "@/models/ImportJob";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { jobId } = await params;
    await connectDB();
    
    const job = await ImportJob.findById(jobId);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    // Fire and forget using setTimeout to detach from request context
    setTimeout(() => {
      processImportJob(jobId).catch((err) => console.error("Background job failed:", err));
    }, 0);

    return NextResponse.json({ success: true, jobNumber: job.jobNumber });
  } catch (err: any) {
    console.error(`[POST /api/admin/bulk-import/job/[jobId]/start]`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
