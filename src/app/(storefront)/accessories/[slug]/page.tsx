/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import AccessoryCategory from "@/models/AccessoryCategory";
import Product from "@/models/Product";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();
  const category = await AccessoryCategory.findOne({ slug, isActive: true }).lean();
  
  if (!category) return { title: "Not Found" };
  
  return {
    title: `${category.name} | Accessories | Udaya Cycles`,
    description: category.description || `Browse our collection of ${category.name} accessories.`,
  };
}

export default async function AccessoryCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();

  const currentCategory = await AccessoryCategory.findOne({ slug, isActive: true }).lean();
  if (!currentCategory) {
    notFound();
  }

  // Fetch all active accessory categories for the navigation bar
  const categories = await AccessoryCategory.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();

  // Fetch products in this category
  const accessories = await Product.find({ 
    accessoryCategory: currentCategory._id, 
    type: "ACCESSORY",
    isActive: true, 
    deletedAt: null 
  })
  .populate("accessoryCategory", "name")
  .sort({ createdAt: -1 })
  .lean();

  return (
    <div className="section-padding bg-bg">
      <div className="container-udaya">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4 uppercase tracking-tight">
            {currentCategory.name}
          </h1>
          {currentCategory.description && (
            <p className="text-lg text-text-secondary max-w-3xl">
              {currentCategory.description}
            </p>
          )}
        </div>

        {/* Categories Bar */}
        {categories.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-4 mb-8 no-scrollbar border-b border-border">
            <Link 
              href="/accessories" 
              className="px-4 py-2 bg-surface hover:bg-surface-raised border border-border hover:border-accent text-text-primary hover:text-accent transition-colors font-medium rounded-full whitespace-nowrap"
            >
              All Accessories
            </Link>
            {categories.map((cat: any) => {
              const isActive = cat.slug === slug;
              return (
                <Link 
                  href={`/accessories/${cat.slug}`} 
                  key={cat._id.toString()}
                  className={`px-4 py-2 font-medium rounded-full whitespace-nowrap border transition-colors ${
                    isActive 
                      ? "bg-surface border-accent text-accent" 
                      : "bg-surface hover:bg-surface-raised border-border hover:border-accent text-text-primary hover:text-accent"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        )}

        {/* Product Grid */}
        {accessories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {accessories.map((product: any) => (
              <Link 
                href={`/products/${product.slug}`} 
                key={product._id.toString()}
                className="group block bg-surface-raised rounded-xl overflow-hidden border border-border hover:border-accent transition-colors shadow-sm"
              >
                <div className="aspect-square bg-surface relative overflow-hidden flex items-center justify-center">
                  {/* Image placeholder */}
                  <div className="w-full h-full bg-surface-overlay flex items-center justify-center text-text-muted group-hover:scale-105 transition-transform duration-500">
                    <span className="font-mono text-xs uppercase tracking-widest">{product.name} Image</span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="text-xs text-text-muted mb-1 uppercase tracking-wider">
                    {product.accessoryCategory?.name || 'Gear'}
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent transition-colors truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="font-mono font-medium text-text-primary">
                      ₹{(product.basePrice / 100).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface-raised rounded-xl border border-border">
            <h3 className="text-xl font-bold text-text-primary mb-2">No items found</h3>
            <p className="text-text-secondary">We couldn&apos;t find any accessories in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
