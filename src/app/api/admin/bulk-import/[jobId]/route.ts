/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { getAdminSession } from "@/lib/auth/admin-auth";
import ImportJob from "@/models/ImportJob";
import ImportFile from "@/models/ImportFile";

// GET /api/admin/bulk-import/[jobId] — get job status + stats
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { jobId } = await params;

    const [job, files] = await Promise.all([
      ImportJob.findById(jobId).populate("createdBy", "username").lean(),
      ImportFile.find({ importJob: jobId })
        .populate("assignedBrand", "name")
        .populate("assignedCategory", "name")
        .sort({ createdAt: 1 })
        .lean(),
    ]);

    if (!job) {
      return NextResponse.json({ error: "Import job not found" }, { status: 404 });
    }

    return NextResponse.json({ job, files });
  } catch (error: any) {
    console.error("[GET /api/admin/bulk-import/[jobId]]", error);
    return NextResponse.json({ error: error.message || "Failed to fetch job" }, { status: 500 });
  }
}
