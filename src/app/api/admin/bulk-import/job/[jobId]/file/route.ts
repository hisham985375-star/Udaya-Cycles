import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { getAdminSession } from "@/lib/auth/admin-auth";
import ImportFile from "@/models/ImportFile";
import { getImportUploadDir } from "@/lib/import/pdf-processor";
import * as path from "path";
import * as fs from "fs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { jobId } = await params;
    const body = await request.json();
    const { filename, brandId, categoryId, base64 } = body;

    if (!filename || !base64) {
      return NextResponse.json({ error: "Missing filename or base64 data" }, { status: 400 });
    }

    await connectDB();
    const uploadDir = getImportUploadDir();
    
    // Save file stream to disk
    const safeFilename = `${jobId}-${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const filePath = path.join(uploadDir, safeFilename);

    const buffer = Buffer.from(base64, "base64");
    fs.writeFileSync(filePath, buffer);

    // Validate PDF magic bytes
    const fd = fs.openSync(filePath, "r");
    const headerBuffer = Buffer.alloc(5);
    fs.readSync(fd, headerBuffer, 0, 5, 0);
    fs.closeSync(fd);

    if (!headerBuffer.toString("ascii").startsWith("%PDF")) {
      fs.unlinkSync(filePath);
      await ImportFile.create({
        importJob: jobId,
        originalName: filename,
        fileSize: 0,
        storagePath: "",
        status: "FAILED",
        errorMessage: "File does not appear to be a valid PDF",
      });
      return NextResponse.json({ success: true, accepted: false });
    }

    await ImportFile.create({
      importJob: jobId,
      originalName: filename,
      fileSize: fs.statSync(filePath).size,
      storagePath: filePath,
      status: "PENDING",
      assignedBrand: brandId || undefined,
      assignedCategory: categoryId || undefined,
    });

    return NextResponse.json({ success: true, accepted: true });
  } catch (err: any) {
    console.error(`[PUT /api/admin/bulk-import/job/[jobId]/file]`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
