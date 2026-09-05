/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db/mongoose";
import Product from "@/models/Product";
import { ArrowRight } from "lucide-react";

export async function FeaturedProductsSection() {
  await connectDB();
  
  // Fetch 3 featured products (using sort as a proxy if we don't have a featured flag)
  const products = await Product.find({ isActive: true, deletedAt: null })
    .populate("category", "name")
    .populate("brand", "name")
    .sort({ regularPrice: -1 }) // Just for demo, fetch most expensive
    .limit(4)
    .lean();

  if (!products || products.length === 0) return null;

  return (
    <section className="section-padding bg-black border-t border-[#2a2a2a]">
      <div className="container-udaya">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-accent font-bold uppercase tracking-widest text-sm mb-2 block">Handpicked</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-text-primary uppercase tracking-tight">
              Featured <span className="text-text-muted">Selection</span>
            </h2>
          </div>
          <Link 
            href="/cycles/category/all" 
            className="text-sm font-bold text-text-primary hover:text-accent transition-colors flex items-center gap-2 uppercase tracking-wide group"
          >
            Explore Catalog
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product: any) => {
            const primaryImage = product.images?.find((img: any) => img.isDefault) || product.images?.[0];
            const imageUrl = primaryImage?.url || "/placeholder-bike.png";

            return (
              <Link 
                href={`/products/${product.slug}`} 
                key={product._id.toString()}
                className="group block"
              >
                <div className="aspect-[4/3] relative w-full mb-4 bg-transparent rounded-2xl overflow-hidden flex items-center justify-center p-6">
                  <Image 
                    src={imageUrl} 
                    alt={product.name} 
                    fill 
                    className="object-contain group-hover:scale-105 transition-transform duration-500 p-6"
                  />
                </div>
                
                <div className="px-2">
                  <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-accent">
                      ₹{((product.salePrice || product.regularPrice) / 100).toLocaleString('en-IN')}
                    </span>
                    {product.salePrice && product.salePrice < product.regularPrice && (
                      <span className="font-mono text-sm text-text-muted line-through">
                        ₹{(product.regularPrice / 100).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
