/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from "@/lib/db/mongoose";
import Product from "@/models/Product";
import Brand from "@/models/Brand";
import Category from "@/models/Category";
import Link from "next/link";
import { Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { AdminProductFilters } from "@/components/admin/AdminProductFilters";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; page?: string; brand?: string; category?: string; size?: string; minPrice?: string; maxPrice?: string }>
}) {
  await connectDB();
  
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  const page = parseInt(resolvedParams.page || "1");
  const brandId = resolvedParams.brand || "";
  const categoryId = resolvedParams.category || "";
  const size = resolvedParams.size || "";
  const minPrice = resolvedParams.minPrice ? parseInt(resolvedParams.minPrice) * 100 : undefined; // Convert to paise
  const maxPrice = resolvedParams.maxPrice ? parseInt(resolvedParams.maxPrice) * 100 : undefined; // Convert to paise
  const limit = 10;
  const skip = (page - 1) * limit;

  // Build the MongoDB filter
  const filter: any = { deletedAt: null };
  if (query) {
    filter.name = { $regex: query, $options: "i" };
  }
  if (brandId) {
    filter.brand = brandId;
  }
  if (categoryId) {
    filter.category = categoryId;
  }
  if (size) {
    filter.size = size;
  }
  
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.regularPrice = {};
    if (minPrice !== undefined) filter.regularPrice.$gte = minPrice;
    if (maxPrice !== undefined) filter.regularPrice.$lte = maxPrice;
  }

  // Fetch reference data for filters
  const [brands, categories] = await Promise.all([
    Brand.find({ isActive: true }).select("_id name").sort({ name: 1 }).lean(),
    Category.find({ isActive: true }).select("_id name").sort({ name: 1 }).lean()
  ]);

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate("brand", "name")
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary uppercase tracking-tight">Products</h1>
          <p className="text-text-secondary mt-1">Manage your catalogue and inventory</p>
        </div>
        
        <Link 
          href="/admin/products/new"
          className="bg-accent text-bg font-bold px-6 py-3 rounded-full hover:bg-accent-dim transition-colors flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
        >
          <Plus className="w-5 h-5" /> Add Product
        </Link>
      </div>

      <div className="bg-surface-raised rounded-2xl border border-border overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col gap-4 justify-between bg-surface">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start md:items-center gap-4 w-full">
            <div className="w-full">
              <AdminProductFilters 
                brands={brands.map(b => ({ _id: b._id.toString(), name: b.name }))} 
                categories={categories.map(c => ({ _id: c._id.toString(), name: c.name }))} 
              />
            </div>
          </div>
          <div className="text-sm font-medium text-text-secondary self-start sm:self-end mt-2 sm:mt-0">
            Showing {products.length} of {total} products
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface text-text-secondary text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-border">Product</th>
                <th className="p-4 font-bold border-b border-border">Brand</th>
                <th className="p-4 font-bold border-b border-border">Category</th>
                <th className="p-4 font-bold border-b border-border">Size</th>
                <th className="p-4 font-bold border-b border-border">Price</th>
                <th className="p-4 font-bold border-b border-border">Status</th>
                <th className="p-4 font-bold border-b border-border text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-text-muted">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product: any) => (
                  <tr key={product._id.toString()} className="hover:bg-surface/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-md bg-bg border border-border overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                          {product.images && product.images.length > 0 ? (
                            <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-text-muted" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-text-primary line-clamp-1">{product.name}</div>
                          <div className="text-xs text-text-muted font-mono">{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-text-secondary font-medium">
                      {product.brand?.name || "—"}
                    </td>
                    <td className="p-4 text-sm text-text-secondary font-medium">
                      {product.category?.name || "—"}
                    </td>
                    <td className="p-4 text-sm text-text-secondary font-medium">
                      {product.size || "—"}
                    </td>
                    <td className="p-4">
                      <div className="font-mono font-bold text-text-primary">
                        ₹{((product.regularPrice || 0) / 100).toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                        product.isActive 
                          ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                          : "bg-text-muted/10 text-text-muted border border-border"
                      }`}>
                        {product.isActive ? "Active" : "Draft"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/admin/products/${product.slug}`}
                          className="p-2 text-text-secondary hover:text-accent bg-bg rounded-md border border-transparent hover:border-border transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeleteProductButton productId={product._id.toString()} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border bg-surface flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Link
                key={i}
                href={`/admin/products?page=${i + 1}${query ? `&q=${query}` : ''}`}
                className={`w-10 h-10 flex items-center justify-center rounded-lg border font-mono font-bold transition-colors ${
                  page === i + 1 
                    ? "bg-accent text-bg border-accent" 
                    : "bg-bg text-text-secondary border-border hover:border-accent hover:text-accent"
                }`}
              >
                {i + 1}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
