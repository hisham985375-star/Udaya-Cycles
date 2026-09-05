/**
 * Job Processor — orchestrates the full import pipeline for a job.
 *
 * Called as fire-and-forget from the API route.
 * Updates ImportJob, ImportFile, and ImportProduct records in MongoDB.
 *
 * Pipeline per file:
 *  1. Extract text & images from PDF
 *  2. Detect products
 *  3. For each product: brand, category, size, image
 *  4. Background removal
 *  5. Cloudinary upload
 *  6. Create ImportProduct records
 *  7. Update job stats
 */

import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { connectDB } from "@/lib/db/mongoose";
import ImportJob from "@/models/ImportJob";
import ImportFile from "@/models/ImportFile";
import ImportProduct from "@/models/ImportProduct";
import Brand from "@/models/Brand";
import Category from "@/models/Category";
import CategoryMapping from "@/models/CategoryMapping";
import { extractFromPDF, getImagesDir } from "./pdf-processor";
import { detectBrand } from "./brand-detector";
import { detectCategory } from "./category-detector";
import { removeBackground, createThumbnail } from "./background-removal";
import type { IBrand } from "@/models/Brand";
import type { ICategory } from "@/models/Category";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ──────────────────────────────────────────────────────────────
// Main entry point — called fire-and-forget
// ──────────────────────────────────────────────────────────────
export async function processImportJob(jobId: string): Promise<void> {
  try {
    await connectDB();

    const job = await ImportJob.findById(jobId);
    if (!job) {
      console.error(`[JOB_PROCESSOR] Job ${jobId} not found`);
      return;
    }

    job.status = "PROCESSING";
    job.startedAt = new Date();
    await job.save();

    // Load reference data once
    const [brands, categories, mappingRules] = await Promise.all([
      Brand.find({ isActive: true }).select("_id name slug").lean(),
      Category.find({ isActive: true }).select("_id name slug").lean(),
      CategoryMapping.find({ isActive: true }).populate("category", "_id name slug").lean(),
    ]);

    const simpleBrands = brands.map((b) => ({
      _id: b._id.toString(),
      name: b.name,
      slug: b.slug,
    }));

    const simpleCategories = categories.map((c) => ({
      _id: c._id.toString(),
      name: c.name,
      slug: c.slug,
    }));

    const simpleMappingRules = mappingRules.map((r) => ({
      keyword: r.keyword,
      categoryId: (r.category as unknown as { _id: { toString(): string } })._id.toString(),
    }));

    // Get all files for this job
    const files = await ImportFile.find({ importJob: jobId }).sort({ createdAt: 1 });
    let processedFiles = 0;
    let totalProductsAll = 0;
    let readyProductsAll = 0;
    let needsReviewAll = 0;
    let failedProductsAll = 0;

    for (const importFile of files) {
      try {
        const fileResult = await processFile(
          importFile,
          job.settings,
          simpleBrands,
          simpleCategories,
          simpleMappingRules
        );

        processedFiles++;
        totalProductsAll += fileResult.total;
        readyProductsAll += fileResult.ready;
        needsReviewAll += fileResult.needsReview;
        failedProductsAll += fileResult.failed;

        // Update job progress
        job.processedFiles = processedFiles;
        job.totalProducts = totalProductsAll;
        job.readyProducts = readyProductsAll;
        job.needsReviewProducts = needsReviewAll;
        job.failedProducts = failedProductsAll;
        await job.save();
      } catch (fileErr) {
        console.error(`[JOB_PROCESSOR] File ${importFile.originalName} failed:`, fileErr);
        const errMsg = fileErr instanceof Error ? fileErr.message : String(fileErr);
        importFile.status = "FAILED";
        importFile.errorMessage = errMsg;
        await importFile.save();
        processedFiles++;
        failedProductsAll++;
        job.processedFiles = processedFiles;
        job.failedProducts = failedProductsAll;
        await job.save();
      }
    }

    // Finalize job status
    if (failedProductsAll > 0 && failedProductsAll < totalProductsAll) {
      job.status = "COMPLETED_WITH_ERRORS";
    } else if (failedProductsAll >= totalProductsAll && totalProductsAll > 0) {
      job.status = "FAILED";
    } else {
      job.status = "COMPLETED";
    }

    job.completedAt = new Date();
    await job.save();

    console.log(`[JOB_PROCESSOR] Job ${jobId} completed: ${totalProductsAll} products detected`);
  } catch (err) {
    console.error(`[JOB_PROCESSOR] Fatal error for job ${jobId}:`, err);
    try {
      const job = await ImportJob.findById(jobId);
      if (job) {
        job.status = "FAILED";
        job.errorMessage = err instanceof Error ? err.message : String(err);
        job.completedAt = new Date();
        await job.save();
      }
    } catch {
      // Best effort
    }
  }
}

// ──────────────────────────────────────────────────────────────
// Process a single ImportFile
// ──────────────────────────────────────────────────────────────
async function processFile(
  importFile: InstanceType<typeof ImportFile>,
  settings: {
    extractImages: boolean;
    attemptBackgroundRemoval: boolean;
    convertToPng: boolean;
    uploadToCloudinary: boolean;
    defaultProductType: "cycle" | "accessory";
  },
  availableBrands: { _id: string; name: string; slug: string }[],
  availableCategories: { _id: string; name: string; slug: string }[],
  categoryMappingRules: { keyword: string; categoryId: string }[]
): Promise<{ total: number; ready: number; needsReview: number; failed: number }> {
  importFile.status = "PROCESSING";
  await importFile.save();

  let assignedBrand = null;
  if (importFile.assignedBrand) {
    assignedBrand = availableBrands.find(
      (b) => b._id === importFile.assignedBrand?.toString()
    ) || null;
  }

  let extraction;
  try {
    extraction = await extractFromPDF(
      importFile.storagePath,
      availableBrands,
      availableCategories,
      categoryMappingRules,
      assignedBrand
    );
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    importFile.status = "FAILED";
    importFile.errorMessage = errMsg;
    await importFile.save();
    return { total: 1, ready: 0, needsReview: 0, failed: 1 };
  }

  importFile.pageCount = extraction.pageCount;
  importFile.productsDetected = extraction.products.length;
  await importFile.save();

  const results = { total: 0, ready: 0, needsReview: 0, failed: 0 };
  const imagesDir = getImagesDir();
  const totalProducts = extraction.products.length;

  for (let i = 0; i < extraction.products.length; i++) {
    const candidate = extraction.products[i];
    if (!candidate) continue;
    results.total++;

    // Update progress
    importFile.processingProgress = Math.round(((i + 1) / totalProducts) * 100);
    await importFile.save();

    const importProduct = new ImportProduct({
      importJob: importFile.importJob,
      importFile: importFile._id,
      sourcePageNumber: candidate.pageNumber,
      status: "PROCESSING",
    });

    try {
      // ── Brand detection ──
      const brandResult = detectBrand(
        candidate.rawText,
        importFile.originalName,
        availableBrands,
        assignedBrand
      );
      importProduct.extractedBrandRaw = brandResult.brandRaw || undefined;
      importProduct.brandConfidence = brandResult.confidence;
      importProduct.brandNeedsReview = brandResult.needsReview;
      if (brandResult.brand) {
        const matchedBrand = await Brand.findOne({ name: brandResult.brand.name }).select("_id");
        if (matchedBrand) {
          importProduct.extractedBrand = matchedBrand._id;
        }
      }

      // ── Category detection ──
      const categoryResult = detectCategory(
        candidate.rawText,
        categoryMappingRules,
        availableCategories
      );
      importProduct.extractedCategoryRaw = categoryResult.categoryRaw || undefined;
      importProduct.categoryConfidence = categoryResult.confidence;
      importProduct.categoryNeedsReview = categoryResult.needsReview;
      if (categoryResult.category) {
        const matchedCat = await Category.findOne({ name: categoryResult.category.name }).select("_id");
        if (matchedCat) {
          importProduct.extractedCategory = matchedCat._id;
        }
      }

      // ── Product name ──
      importProduct.extractedName = candidate.productName || undefined;
      importProduct.nameConfidence = candidate.nameConfidence;
      importProduct.nameNeedsReview = !candidate.productName || candidate.nameConfidence < 60;

      // ── Size ──
      importProduct.extractedSize = candidate.size || undefined;
      importProduct.sizeConfidence = candidate.sizeConfidence;
      importProduct.sizeNeedsReview = !candidate.size;

      // ── Optional fields ──
      importProduct.extractedDescription = candidate.description || undefined;
      importProduct.extractedSpecifications = candidate.specifications;
      if (candidate.rawPrice) {
        const priceNum = parseFloat(candidate.rawPrice.replace(/,/g, ""));
        if (!isNaN(priceNum)) {
          importProduct.extractedRegularPrice = Math.round(priceNum * 100); // convert to paise
        }
      }

      // ── Image processing ──
      if (settings.extractImages && candidate.imageBuffer) {
        const imageResult = await processProductImage(
          candidate.imageBuffer,
          importFile.importJob.toString(),
          i,
          settings,
          imagesDir
        );

        importProduct.image = {
          originalPath: imageResult.originalPath,
          processedPath: imageResult.processedPath,
          cloudinaryPublicId: imageResult.cloudinaryPublicId,
          cloudinaryUrl: imageResult.cloudinaryUrl,
          width: imageResult.width,
          height: imageResult.height,
          fileSize: imageResult.fileSize,
          extractionMethod: candidate.imageExtractionMethod as "embedded" | "rendered",
          qualityIssues: imageResult.qualityIssues,
        };

        importProduct.imageConfidence = imageResult.confidence;
        importProduct.imageNeedsReview =
          imageResult.qualityIssues.length > 0 || imageResult.confidence < 70;
      }

      // ── Determine final status ──
      const needsReview =
        importProduct.nameNeedsReview ||
        importProduct.brandNeedsReview ||
        importProduct.categoryNeedsReview ||
        importProduct.sizeNeedsReview ||
        importProduct.imageNeedsReview;

      if (!importProduct.extractedName) {
        importProduct.status = "NEEDS_REVIEW";
        importProduct.errorMessages = ["Product name could not be extracted"];
      } else {
        importProduct.status = needsReview ? "NEEDS_REVIEW" : "READY";
      }

      await importProduct.save();

      if (importProduct.status === "READY") results.ready++;
      else results.needsReview++;
    } catch (productErr) {
      const errMsg = productErr instanceof Error ? productErr.message : String(productErr);
      console.error(`[JOB_PROCESSOR] Product ${i} in ${importFile.originalName} failed:`, productErr);
      importProduct.status = "FAILED";
      importProduct.errorMessages = [errMsg];
      await importProduct.save();
      results.failed++;
    }
  }

  importFile.status = "COMPLETED";
  importFile.processingProgress = 100;
  await importFile.save();

  return results;
}

// ──────────────────────────────────────────────────────────────
// Process a single product image
// ──────────────────────────────────────────────────────────────
async function processProductImage(
  imageBuffer: Buffer,
  jobId: string,
  productIndex: number,
  settings: {
    attemptBackgroundRemoval: boolean;
    convertToPng: boolean;
    uploadToCloudinary: boolean;
  },
  imagesDir: string
): Promise<{
  originalPath?: string;
  processedPath?: string;
  cloudinaryPublicId?: string;
  cloudinaryUrl?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  qualityIssues: string[];
  confidence: number;
}> {
  const qualityIssues: string[] = [];
  let confidence = 70;

  // Save original image
  const originalFilename = `${jobId}-${productIndex}-original.png`;
  const originalPath = path.join(imagesDir, originalFilename);
  fs.writeFileSync(originalPath, imageBuffer);

  let processedBuffer = imageBuffer;
  let processedPath = originalPath;

  // Background removal
  if (settings.attemptBackgroundRemoval) {
    try {
      const bgResult = await removeBackground(imageBuffer);
      processedBuffer = bgResult.buffer;
      qualityIssues.push(...bgResult.qualityIssues);

      if (bgResult.qualityIssues.length === 0) confidence = 85;

      const processedFilename = `${jobId}-${productIndex}-processed.png`;
      processedPath = path.join(imagesDir, processedFilename);
      fs.writeFileSync(processedPath, processedBuffer);
    } catch (bgErr) {
      console.warn(`[IMG_PROC] Background removal failed:`, bgErr);
      qualityIssues.push("background_removal_failed");
      confidence = 50;
    }
  }

  // Get image metadata
  let width: number | undefined;
  let height: number | undefined;
  try {
    const sharp = (await import("sharp")).default;
    const metadata = await sharp(processedBuffer).metadata();
    width = metadata.width;
    height = metadata.height;

    if (width && height) {
      if (width < 300 || height < 300) {
        qualityIssues.push("low_resolution");
        confidence = Math.max(confidence - 15, 30);
      }
    }
  } catch {
    // metadata extraction failed
  }

  const fileSize = processedBuffer.length;

  // Cloudinary upload
  let cloudinaryPublicId: string | undefined;
  let cloudinaryUrl: string | undefined;

  if (settings.uploadToCloudinary) {
    try {
      const uploadResult = await new Promise<{
        public_id: string;
        secure_url: string;
        width: number;
        height: number;
      }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "udaya-cycles/import",
            format: "png",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as { public_id: string; secure_url: string; width: number; height: number });
          }
        );
        uploadStream.end(processedBuffer);
      });

      cloudinaryPublicId = uploadResult.public_id;
      cloudinaryUrl = uploadResult.secure_url;
      width = uploadResult.width;
      height = uploadResult.height;
    } catch (cloudErr) {
      console.error(`[IMG_PROC] Cloudinary upload failed:`, cloudErr);
      qualityIssues.push("cloudinary_upload_failed");
    }
  }

  return {
    originalPath,
    processedPath,
    cloudinaryPublicId,
    cloudinaryUrl,
    width,
    height,
    fileSize,
    qualityIssues,
    confidence,
  };
}
