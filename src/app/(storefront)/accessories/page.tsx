/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from "@/lib/db/mongoose";
import AccessoryCategory from "@/models/AccessoryCategory";
import Product from "@/models/Product";
import Link from "next/link";

export const metadata = {
  title: "Accessories | Udaya Cycles",
  description: "Browse premium accessories and gear for your ultimate riding experience.",
};

export default async function AccessoriesPage() {
  await connectDB();

  // Fetch all active accessory categories
  const categories = await AccessoryCategory.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();

  // Fetch all products that are type ACCESSORY
  const accessories = await Product.find({ 
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
            Riding <span className="text-accent">Accessories</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl">
            Complete your setup with our premium selection of gear and components.
          </p>
        </div>

        {/* Categories Bar */}
        {categories.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-4 mb-8 no-scrollbar border-b border-border">
            <Link 
              href="/accessories" 
              className="px-4 py-2 bg-surface border border-accent text-accent font-medium rounded-full whitespace-nowrap"
            >
              All Accessories
            </Link>
            {categories.map((cat: any) => (
              <Link 
                href={`/accessories/${cat.slug}`} 
                key={cat._id.toString()}
                className="px-4 py-2 bg-surface hover:bg-surface-raised border border-border hover:border-accent text-text-primary hover:text-accent transition-colors font-medium rounded-full whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
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
            <h3 className="text-xl font-bold text-text-primary mb-2">No accessories found</h3>
            <p className="text-text-secondary">We are restocking our gear. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
