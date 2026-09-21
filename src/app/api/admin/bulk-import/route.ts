/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";
import { connectDB } from "@/lib/db/mongoose";
import { getAdminSession } from "@/lib/auth/admin-auth";
import ImportJob from "@/models/ImportJob";
import ImportFile from "@/models/ImportFile";
import { getImportUploadDir } from "@/lib/import/pdf-processor";
import { processImportJob } from "@/lib/import/job-processor";

// Generate sequential job number
async function generateJobNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const lastJob = await ImportJob.findOne({ jobNumber: new RegExp(`^${year}-`) })
    .sort({ createdAt: -1 })
    .select("jobNumber")
    .lean();

  let seq = 1;
  if (lastJob) {
    const parts = lastJob.jobNumber.split("-");
    seq = parseInt(parts[1] || "0") + 1;
  }

  return `${year}-${String(seq).padStart(3, "0")}`;
}

// GET /api/admin/bulk-import — list all import jobs
export async function GET(request: Request) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      ImportJob.find()
        .populate("createdBy", "username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ImportJob.countDocuments(),
    ]);

    return NextResponse.json({
      jobs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error("[GET /api/admin/bulk-import]", error);
    return NextResponse.json({ error: error.message || "Failed to fetch import jobs" }, { status: 500 });
  }
}
