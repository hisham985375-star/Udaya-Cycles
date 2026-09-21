import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import ImportJob from "@/models/ImportJob";
import ImportProduct from "@/models/ImportProduct";
import Product from "@/models/Product";
import { requireAdminAPI } from "@/lib/auth/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const adminUser = await requireAdminAPI();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = params;
    await connectDB();

    const job = await ImportJob.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const body = await req.json();
    const productIds: string[] = body.productIds;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "No product IDs provided" },
        { status: 400 }
      );
    }

    const importProducts = await ImportProduct.find({
      _id: { $in: productIds },
      importJob: jobId,
    });

    let created = 0;
    let skipped = 0;
    let errors: string[] = [];

    // Assuming we insert a bunch of products
    for (const ip of importProducts) {
      try {
        // Double check duplication in case things changed
        const existingBySku = await Product.findOne({ sku: ip.extractedSku });
        if (existingBySku) {
          skipped++;
          errors.push(`SKU ${ip.extractedSku} already exists in database.`);
          ip.status = "REJECTED";
          ip.errorMessages = ["SKU already exists"];
          await ip.save();
          continue;
        }

        const newProduct = new Product({
          name: ip.extractedName,
          sku: ip.extractedSku,
          description: ip.extractedDescription || "",
          type: job.settings?.defaultProductType || "cycle",
          brand: ip.extractedBrand,
          category: ip.extractedCategory,
          size: ip.extractedSize || "N/A",
          regularPrice: ip.extractedRegularPrice || 0,
          salePrice: ip.extractedSalePrice || 0,
          stockQuantity: ip.extractedStockQuantity || 0,
          specifications: ip.extractedSpecifications || [],
          // Leave images empty since we didn't upload to cloudinary
          images: [], 
          isPublished: false, // Create as draft by default
        });

        await newProduct.save();

        ip.status = "APPROVED";
        await ip.save();

        created++;
      } catch (err) {
        skipped++;
        errors.push(`Failed to import ${ip.extractedName || ip._id}: ${err instanceof Error ? err.message : String(err)}`);
        ip.status = "FAILED";
        ip.errorMessages = [err instanceof Error ? err.message : String(err)];
        await ip.save();
      }
    }

    // Update job counts
    const approvedCount = await ImportProduct.countDocuments({ importJob: jobId, status: "APPROVED" });
    const rejectedCount = await ImportProduct.countDocuments({ importJob: jobId, status: "REJECTED" });
    
    job.approvedProducts = approvedCount;
    job.rejectedProducts = rejectedCount;
    await job.save();

    return NextResponse.json({
      success: true,
      created,
      skipped,
      errors,
    });
  } catch (error) {
    console.error("[BULK_IMPORT_EXECUTE_API]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
