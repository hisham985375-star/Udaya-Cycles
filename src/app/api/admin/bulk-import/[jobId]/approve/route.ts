/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { getAdminSession } from "@/lib/auth/admin-auth";
import ImportJob from "@/models/ImportJob";
import ImportProduct from "@/models/ImportProduct";
import Product from "@/models/Product";
import slugify from "slugify";

// POST /api/admin/bulk-import/[jobId]/approve
// Creates draft Product records for all APPROVED (or READY) import products
export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { jobId } = await params;
    const body = await request.json().catch(() => ({}));
    const { productIds, approveAll } = body;

    const job = await ImportJob.findById(jobId);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    // Which products to approve
    let filter: any = { importJob: jobId };
    if (approveAll) {
      filter.status = "READY";
    } else if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      filter._id = { $in: productIds };
      filter.status = { $in: ["READY", "APPROVED"] };
    } else {
      return NextResponse.json({ error: "Specify productIds or approveAll=true" }, { status: 400 });
    }

    const importProducts = await ImportProduct.find(filter)
      .populate("extractedBrand", "_id name slug")
      .populate("extractedCategory", "_id name slug")
      .lean();

    if (importProducts.length === 0) {
      return NextResponse.json({ error: "No products found to approve" }, { status: 400 });
    }

    const results = {
      created: 0,
      skipped: 0,
      duplicates: 0,
      errors: [] as string[],
    };

    for (const importProd of importProducts) {
      try {
        const productName = importProd.extractedName;
        if (!productName) {
          results.skipped++;
          continue;
        }

        // ── Duplicate detection ──────────────────────────
        const orConditions: Record<string, unknown>[] = [
          {
            name: { $regex: `^${productName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
            ...(importProd.extractedBrand ? { brand: importProd.extractedBrand } : {}),
          },
        ];
        if (importProd.extractedSku) {
          orConditions.push({ sku: importProd.extractedSku });
        }

        const existingProduct = await Product.findOne({
          $or: orConditions,
          deletedAt: null,
        }).select("_id name").lean();

        if (existingProduct) {
          results.duplicates++;
          await ImportProduct.findByIdAndUpdate(importProd._id, {
            $set: {
              status: "NEEDS_REVIEW",
              reviewNotes: `Possible duplicate of existing product: "${existingProduct.name}" (ID: ${existingProduct._id})`,
            },
          });
          continue;
        }

        // ── Generate unique SKU ──────────────────────────
        let sku = importProd.extractedSku;
        if (!sku) {
          const brandSlug = (importProd.extractedBrand as any)?.slug || "unk";
          const nameSlug = slugify(productName, { lower: true, strict: true }).substring(0, 15);
          sku = `IMP-${brandSlug.substring(0, 4)}-${nameSlug}-${Date.now().toString(36)}`.toUpperCase();
        }

        // Ensure SKU is unique
        let finalSku = sku;
        let skuCounter = 1;
        while (await Product.findOne({ sku: finalSku })) {
          finalSku = `${sku}-${skuCounter}`;
          skuCounter++;
        }

        // ── Generate unique slug ──────────────────────────
        const baseSlug = slugify(productName, { lower: true, strict: true });
        let slug = baseSlug;
        let slugCounter = 1;
        while (await Product.findOne({ slug })) {
          slug = `${baseSlug}-${slugCounter}`;
          slugCounter++;
        }

        // ── Build images array ──────────────────────────
        const images = [];
        if (importProd.image?.cloudinaryUrl && importProd.image?.cloudinaryPublicId) {
          images.push({
            url: importProd.image.cloudinaryUrl,
            publicId: importProd.image.cloudinaryPublicId,
            alt: productName,
            sortOrder: 0,
            isDefault: true,
          });
        }

        // ── Create draft Product ──────────────────────────
        const newProduct = new Product({
          name: productName,
          slug,
          sku: finalSku,
          type: job.settings.defaultProductType,
          category: (importProd.extractedCategory as any)?._id || undefined,
          brand: (importProd.extractedBrand as any)?._id || undefined,
          description: importProd.extractedDescription || undefined,
          size: importProd.extractedSize || undefined,
          regularPrice: importProd.extractedRegularPrice || 0,
          salePrice: importProd.extractedSalePrice || undefined,
          stock: 0,
          images,
          specifications: importProd.extractedSpecifications?.map((s) => ({
            groupName: "Specifications",
            fields: [{ label: s.label, value: s.value }],
          })) || [],
          // Draft: isActive = false
          isActive: false,
          isNewArrival: false,
          isFeatured: false,
        });

        await newProduct.save();

        // Update import product
        await ImportProduct.findByIdAndUpdate(importProd._id, {
          $set: {
            status: "APPROVED",
            createdProductId: newProduct._id,
          },
        });

        results.created++;
      } catch (productErr: any) {
        const errMsg = productErr instanceof Error ? productErr.message : String(productErr);
        results.errors.push(`${importProd.extractedName || "Unknown"}: ${errMsg}`);
        results.skipped++;
      }
    }

    // Update job approved count
    const approvedTotal = await ImportProduct.countDocuments({ importJob: jobId, status: "APPROVED" });
    await ImportJob.findByIdAndUpdate(jobId, { approvedProducts: approvedTotal });

    return NextResponse.json({
      success: true,
      created: results.created,
      duplicates: results.duplicates,
      skipped: results.skipped,
      errors: results.errors,
    });
  } catch (error: any) {
    console.error("[POST /api/admin/bulk-import/[jobId]/approve]", error);
    return NextResponse.json({ error: error.message || "Approval failed" }, { status: 500 });
  }
}
