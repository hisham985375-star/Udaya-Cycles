import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { connectDB } from "@/lib/db/mongoose";
import jwt from "jsonwebtoken";
import ImportJob from "@/models/ImportJob";
import ImportFile from "@/models/ImportFile";
import { getImportUploadDir } from "@/lib/import/pdf-processor";
import { processImportJob } from "@/lib/import/job-processor";

export const config = {
  api: {
    bodyParser: false, // Disabling Next.js body parser to handle large files via formidable
  },
};

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = req.cookies.admin_token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let adminSession;
    try {
      adminSession = jwt.verify(token, process.env.ADMIN_JWT_SECRET as string) as any;
    } catch {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await connectDB();
    const uploadDir = getImportUploadDir();

    // Parse form with formidable to avoid Next.js App Router body size limits
    const form = formidable({
      maxFileSize: parseInt(process.env.MAX_IMPORT_FILE_SIZE_MB || "200") * 1024 * 1024,
      uploadDir, // Formidable will stream chunks directly to this folder!
      keepExtensions: true,
      multiples: true,
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Parse settings
    const settingsJson = fields.settings ? (Array.isArray(fields.settings) ? fields.settings[0] : fields.settings) : "";
    let settings = {
      extractImages: true,
      attemptBackgroundRemoval: true,
      convertToPng: true,
      uploadToCloudinary: true,
      defaultProductType: "cycle" as "cycle" | "accessory",
    };
    if (settingsJson) {
      try {
        settings = { ...settings, ...JSON.parse(settingsJson as string) };
      } catch {}
    }

    // Parse assignments
    const fileAssignmentsJson = fields.fileAssignments ? (Array.isArray(fields.fileAssignments) ? fields.fileAssignments[0] : fields.fileAssignments) : "";
    let fileAssignments: Record<string, { brandId?: string; categoryId?: string }> = {};
    if (fileAssignmentsJson) {
      try {
        fileAssignments = JSON.parse(fileAssignmentsJson as string);
      } catch {}
    }

    // Get files array
    const rawFiles = files.files;
    if (!rawFiles) {
      return res.status(400).json({ error: "No files uploaded" });
    }
    const uploadedFiles = Array.isArray(rawFiles) ? rawFiles : [rawFiles];

    // Create the import job
    const jobNumber = await generateJobNumber();
    const job = await ImportJob.create({
      jobNumber,
      status: "QUEUED",
      createdBy: adminSession.id,
      totalFiles: uploadedFiles.length,
      processedFiles: 0,
      settings,
    });

    const importFiles = [];

    for (const file of uploadedFiles) {
      // Validate PDF
      if (!file.originalFilename?.toLowerCase().endsWith(".pdf")) {
        const failedFile = await ImportFile.create({
          importJob: job._id,
          originalName: file.originalFilename || "unknown",
          fileSize: file.size,
          storagePath: "",
          status: "FAILED",
          errorMessage: "File is not a PDF",
        });
        importFiles.push(failedFile);
        // Delete the temporary file written by formidable
        fs.unlinkSync(file.filepath);
        continue;
      }

      // Check magic bytes by reading first 5 bytes
      const fd = fs.openSync(file.filepath, "r");
      const buffer = Buffer.alloc(5);
      fs.readSync(fd, buffer, 0, 5, 0);
      fs.closeSync(fd);

      if (!buffer.toString("ascii").startsWith("%PDF")) {
        const failedFile = await ImportFile.create({
          importJob: job._id,
          originalName: file.originalFilename,
          fileSize: file.size,
          storagePath: "",
          status: "FAILED",
          errorMessage: "File does not appear to be a valid PDF",
        });
        importFiles.push(failedFile);
        fs.unlinkSync(file.filepath);
        continue;
      }

      // Rename the file written by formidable to our standard naming convention
      const safeFilename = `${job._id}-${Date.now()}-${file.originalFilename.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const newPath = path.join(uploadDir, safeFilename);
      fs.renameSync(file.filepath, newPath);

      const assignment = fileAssignments[file.originalFilename] || {};
      const importFile = await ImportFile.create({
        importJob: job._id,
        originalName: file.originalFilename,
        fileSize: file.size,
        storagePath: newPath,
        status: "PENDING",
        assignedBrand: assignment.brandId || undefined,
        assignedCategory: assignment.categoryId || undefined,
      });
      importFiles.push(importFile);
    }

    // Start background processing
    processImportJob(job._id.toString()).catch((err) => {
      console.error(`[BULK_IMPORT] Background processing error for job ${job._id}:`, err);
    });

    return res.status(200).json({
      success: true,
      jobId: job._id.toString(),
      jobNumber: job.jobNumber,
      filesAccepted: importFiles.length,
    });
  } catch (error: any) {
    console.error("[POST /api/admin/bulk-import-legacy]", error);
    return res.status(500).json({ error: error.message || "Failed to start import" });
  }
}
