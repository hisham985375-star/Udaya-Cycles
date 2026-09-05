/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { getAdminSession } from "@/lib/auth/admin-auth";
import ImportJob from "@/models/ImportJob";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { jobId } = await params;

    const job = await ImportJob.findById(jobId);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    if (job.status === "COMPLETED" || job.status === "COMPLETED_WITH_ERRORS") {
      return NextResponse.json({ error: "Cannot cancel a completed job" }, { status: 400 });
    }

    job.status = "CANCELLED";
    job.completedAt = new Date();
    await job.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
