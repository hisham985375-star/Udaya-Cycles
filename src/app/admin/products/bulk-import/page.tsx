import { connectDB } from "@/lib/db/mongoose";
import Brand from "@/models/Brand";
import Category from "@/models/Category";
import Link from "next/link";
import { Upload } from "lucide-react";
import { BulkImportClient } from "@/components/admin/bulk-import/BulkImportClient";

export const dynamic = "force-dynamic";

export default async function BulkImportPage() {
  await connectDB();

  const [brands, categories] = await Promise.all([
    Brand.find({ isActive: true }).select("_id name").sort({ name: 1 }).lean(),
    Category.find({ isActive: true }).select("_id name").sort({ name: 1 }).lean(),
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
            <span className="text-text-primary">Quick Import</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-text-primary uppercase tracking-tight flex items-center gap-3">
            <Upload className="w-7 h-7 text-accent" />
            Quick Paste Import
          </h1>
          <p className="text-text-secondary mt-1">
            Instantly import products by pasting text from Excel or Word.
          </p>
        </div>
      </div>

      {/* Main import UI */}
      <BulkImportClient brands={simpleBrands} categories={simpleCategories} />
    </div>
  );
}
