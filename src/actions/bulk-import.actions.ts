"use server";

import { writeFile } from "fs/promises";
import path from "path";
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

export async function startBulkImportAction(formData: FormData) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      throw new Error("Unauthorized");
    }

    await connectDB();

    // Parse settings
    const settingsJson = formData.get("settings") as string;
    let settings = {
      extractImages: true,
      attemptBackgroundRemoval: true,
      convertToPng: true,
      uploadToCloudinary: true,
      defaultProductType: "cycle" as "cycle" | "accessory",
    };
    if (settingsJson) {
      try {
        settings = { ...settings, ...JSON.parse(settingsJson) };
      } catch {
        // Use defaults
      }
    }

    // Parse per-file brand/category assignments
    const fileAssignmentsJson = formData.get("fileAssignments") as string;
    let fileAssignments: Record<string, { brandId?: string; categoryId?: string }> = {};
    if (fileAssignmentsJson) {
      try {
        fileAssignments = JSON.parse(fileAssignmentsJson);
      } catch {
        // Use empty
      }
    }

    // Get uploaded files
    const files = formData.getAll("files") as File[];
    if (!files || files.length === 0) {
      throw new Error("No files uploaded");
    }

    // Validate files
    const MAX_SIZE_BYTES = parseInt(process.env.MAX_IMPORT_FILE_SIZE_MB || "200") * 1024 * 1024;
    const invalidFiles: string[] = [];

    for (const file of files) {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        invalidFiles.push(`${file.name}: not a PDF file`);
        continue;
      }
      if (file.size > MAX_SIZE_BYTES) {
        invalidFiles.push(`${file.name}: exceeds maximum size of ${process.env.MAX_IMPORT_FILE_SIZE_MB || 200}MB`);
      }
    }

    if (invalidFiles.length > 0) {
      throw new Error(`Some files are invalid: ${invalidFiles.join(", ")}`);
    }

    // Create the import job
    const jobNumber = await generateJobNumber();
    const job = await ImportJob.create({
      jobNumber,
      status: "QUEUED",
      createdBy: adminSession.id,
      totalFiles: files.length,
      processedFiles: 0,
      settings,
    });

    // Save uploaded PDFs and create ImportFile records
    const uploadDir = getImportUploadDir();
    const importFiles = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Validate PDF magic bytes
      const header = buffer.slice(0, 5).toString("ascii");
      if (!header.startsWith("%PDF")) {
        // Create a failed ImportFile record
        const failedFile = await ImportFile.create({
          importJob: job._id,
          originalName: file.name,
          fileSize: file.size,
          storagePath: "",
          status: "FAILED",
          errorMessage: "File does not appear to be a valid PDF",
        });
        importFiles.push(failedFile);
        continue;
      }

      // Save to disk
      const safeFilename = `${job._id}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const filePath = path.join(uploadDir, safeFilename);
      await writeFile(filePath, buffer);

      const assignment = fileAssignments[file.name] || {};
      const importFile = await ImportFile.create({
        importJob: job._id,
        originalName: file.name,
        fileSize: file.size,
        storagePath: filePath,
        status: "PENDING",
        assignedBrand: assignment.brandId || undefined,
        assignedCategory: assignment.categoryId || undefined,
      });
      importFiles.push(importFile);
    }

    // Start processing in the background (fire-and-forget)
    processImportJob(job._id.toString()).catch((err) => {
      console.error(`[BULK_IMPORT] Background processing error for job ${job._id}:`, err);
    });

    return {
      success: true,
      jobId: job._id.toString(),
      jobNumber: job.jobNumber,
      filesAccepted: importFiles.length,
    };
  } catch (error: any) {
    console.error("[startBulkImportAction]", error);
    return { success: false, error: error.message || "Failed to start import" };
  }
}
