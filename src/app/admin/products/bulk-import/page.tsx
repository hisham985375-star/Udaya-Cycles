import { connectDB } from "@/lib/db/mongoose";
import Brand from "@/models/Brand";
import Category from "@/models/Category";
import ImportJob from "@/models/ImportJob";
import Link from "next/link";
import { Upload, History } from "lucide-react";
import { BulkImportClient } from "@/components/admin/bulk-import/BulkImportClient";
import { ImportHistoryTable } from "@/components/admin/bulk-import/ImportHistoryTable";

export const dynamic = "force-dynamic";

export default async function BulkImportPage() {
  await connectDB();

  const [brands, categories, recentJobs] = await Promise.all([
    Brand.find({ isActive: true }).select("_id name").sort({ name: 1 }).lean(),
    Category.find({ isActive: true }).select("_id name").sort({ name: 1 }).lean(),
    ImportJob.find()
      .populate("createdBy", "username")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  const simpleBrands = brands.map((b) => ({ _id: b._id.toString(), name: b.name }));
  const simpleCategories = categories.map((c) => ({ _id: c._id.toString(), name: c.name }));

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-text-muted text-sm mb-1">
            <Link href="/admin/products" className="hover:text-text-primary transition-colors">
              Products
            </Link>
            <span>/</span>
            <span className="text-text-primary">Bulk Import</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-text-primary uppercase tracking-tight flex items-center gap-3">
            <Upload className="w-7 h-7 text-accent" />
            Bulk Product Import
          </h1>
          <p className="text-text-secondary mt-1">
            Import bicycle products from catalog PDFs in bulk
          </p>
        </div>
      </div>

      {/* Main import UI */}
      <BulkImportClient brands={simpleBrands} categories={simpleCategories} />

      {/* Import History */}
      {recentJobs.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-4">
            <History className="w-5 h-5 text-text-muted" />
            <h2 className="text-xl font-bold text-text-primary font-display">Import History</h2>
          </div>
          <div className="bg-surface-raised border border-border rounded-2xl overflow-hidden">
            <ImportHistoryTable
              jobs={recentJobs.map((j) => ({
                _id: j._id.toString(),
                jobNumber: j.jobNumber,
                status: j.status,
                totalFiles: j.totalFiles,
                processedFiles: j.processedFiles,
                totalProducts: j.totalProducts,
                readyProducts: j.readyProducts,
                needsReviewProducts: j.needsReviewProducts,
                failedProducts: j.failedProducts,
                createdBy: j.createdBy
                  ? { username: (j.createdBy as { username?: string }).username || "" }
                  : undefined,
                createdAt: j.createdAt.toISOString(),
                completedAt: j.completedAt?.toISOString(),
              }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
