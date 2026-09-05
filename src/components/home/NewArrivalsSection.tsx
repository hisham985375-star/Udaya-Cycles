/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db/mongoose";
import Product from "@/models/Product";

const blobShapes = [
  "60% 40% 30% 70% / 60% 30% 70% 40%",
  "40% 60% 70% 30% / 40% 50% 60% 50%",
  "50% 50% 30% 70% / 50% 50% 70% 50%",
  "70% 30% 50% 50% / 30% 30% 70% 70%"
];

export async function NewArrivalsSection() {
  await connectDB();
  
  // Fetch products explicitly marked as New Arrival
  const products = await Product.find({ 
    isActive: true, 
    deletedAt: null, 
    type: "cycle",
    isNewArrival: true 
  })
    .sort({ newArrivalOrder: 1, createdAt: -1 })
    .limit(4)
    .lean();

  if (!products || products.length === 0) return null;

  return (
    <section className="py-20 bg-black">
      <div className="container-udaya">
        <h2 className="text-3xl md:text-4xl font-normal text-accent mb-12">
          New Arrivals
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product: any, index: number) => {
            const primaryImage = product.images?.find((img: any) => img.isDefault) || product.images?.[0];
            const imageUrl = primaryImage?.url || "/placeholder-bike.png";
            const blobShape = blobShapes[index % blobShapes.length];

            return (
              <Link 
                href={`/products/${product.slug}`} 
                key={product._id.toString()}
                className="group block relative"
              >
                {/* Blob Image Container */}
                <div className="relative aspect-[4/3] w-full flex items-center justify-center mb-6">
                  {/* The White Blob */}
                  <div 
                    className="absolute inset-0 bg-white transition-transform duration-700 group-hover:scale-105"
                    style={{ borderRadius: blobShape }}
                  ></div>
                  
                  {/* Product Image */}
                  <div className="relative z-10 w-[90%] h-[90%] group-hover:scale-110 transition-transform duration-500">
                    <Image 
                      src={imageUrl} 
                      alt={product.name} 
                      fill 
                      className="object-contain"
                    />
                  </div>

                  {/* Sale Badge */}
                  <div className="absolute bottom-4 left-4 z-20 bg-[#111] border border-[#333] text-white/90 text-xs px-4 py-1.5 rounded-full">
                    Sale
                  </div>
                </div>
                
                {/* Product Details */}
                <div className="px-2">
                  <h3 className="text-[15px] font-normal text-accent underline decoration-accent/50 underline-offset-4 mb-3 line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#666] line-through font-mono">
                      Rs. {(product.regularPrice / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-sm text-accent font-bold font-mono">
                      Rs. {((product.salePrice || product.regularPrice) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
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
