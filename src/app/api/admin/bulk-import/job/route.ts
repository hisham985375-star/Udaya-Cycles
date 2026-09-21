import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { getAdminSession } from "@/lib/auth/admin-auth";
import ImportJob from "@/models/ImportJob";

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

export async function POST(request: Request) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const settings = {
      defaultProductType: "cycle" as "cycle" | "accessory",
      regularPrice: "",
      salePrice: "",
      stockQuantity: "",
      ...body.settings,
    };

    const jobNumber = await generateJobNumber();
    const job = await ImportJob.create({
      jobNumber,
      status: "QUEUED",
      createdBy: adminSession.id,
      totalFiles: body.totalFiles || 1,
      processedFiles: 0,
      settings,
    });

    return NextResponse.json({ success: true, jobId: job._id.toString() });
  } catch (err: any) {
    console.error("[POST /api/admin/bulk-import/job]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
