import { connectDB } from "@/lib/db/mongoose";
import Brand from "@/models/Brand";
import Category from "@/models/Category";
import ImportJob from "@/models/ImportJob";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { ImportJobProgress } from "@/components/admin/bulk-import/ImportJobProgress";
import { ImportProductsTable } from "@/components/admin/bulk-import/ImportProductsTable";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default async function ImportJobDetailPage({ params }: PageProps) {
  const { jobId } = await params;

  await connectDB();

  const [job, brands, categories] = await Promise.all([
    ImportJob.findById(jobId).lean(),
    Brand.find({ isActive: true }).select("_id name").sort({ name: 1 }).lean(),
    Category.find({ isActive: true }).select("_id name").sort({ name: 1 }).lean(),
  ]);

  if (!job) {
    return (
      <div className="text-center py-20 text-text-muted">
        <p>Import job not found</p>
        <Link href="/admin/products/bulk-import" className="text-accent hover:underline mt-2 inline-block">
          ← Back to Bulk Import
        </Link>
      </div>
    );
  }

  const simpleBrands = brands.map((b) => ({ _id: b._id.toString(), name: b.name }));
  const simpleCategories = categories.map((c) => ({ _id: c._id.toString(), name: c.name }));

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-text-muted text-sm mb-1">
            <Link href="/admin/products" className="hover:text-text-primary transition-colors">
              Products
            </Link>
            <span>/</span>
            <Link
              href="/admin/products/bulk-import"
              className="hover:text-text-primary transition-colors"
            >
              Bulk Import
            </Link>
            <span>/</span>
            <span className="text-text-primary">#{job.jobNumber}</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-text-primary uppercase tracking-tight flex items-center gap-3">
            <Package className="w-7 h-7 text-accent" />
            Import Review
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/bulk-import"
            className="flex items-center gap-2 text-sm text-text-secondary border border-border hover:border-accent hover:text-accent px-4 py-2.5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            New Import
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center gap-2 text-sm text-text-secondary border border-border hover:border-accent hover:text-accent px-4 py-2.5 rounded-full transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>

      {/* Job Progress */}
      <div className="mb-8">
        <ImportJobProgress jobId={jobId} />
      </div>

      {/* Product Review Table — only show when processing has started */}
      {["PROCESSING", "COMPLETED", "COMPLETED_WITH_ERRORS", "FAILED"].includes(job.status) && (
        <div>
          <h2 className="text-xl font-bold text-text-primary font-display mb-4 uppercase tracking-tight">
            Product Review
          </h2>
          <ImportProductsTable
            jobId={jobId}
            brands={simpleBrands}
            categories={simpleCategories}
            readyCount={job.readyProducts}
          />
        </div>
      )}
    </div>
  );
}
