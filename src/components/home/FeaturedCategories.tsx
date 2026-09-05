/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";

export async function FeaturedCategories() {
  await connectDB();
  
  // Fetch active categories
  const categories = await Category.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .limit(4)
    .lean();

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-20 bg-black">
      <div className="container-udaya">
        <h2 className="text-3xl md:text-4xl font-normal text-accent mb-12">
          Cycles by Category
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {categories.map((category: any) => {
            // You can paste your 4 specific image URLs here inside the quotes!
            let imageUrl = category.image?.url;
            
            if (!imageUrl) {
              if (category.name.includes("MTB")) {
                imageUrl = "/pictures/mtb category img.png"; // <-- Change MTB image here
              } else if (category.name.includes("Kids")) {
                imageUrl = "/pictures/kids category img.png"; // <-- Change Kids image here
              } else if (category.name.includes("Girl") || category.name.includes("Ladies")) {
                imageUrl = "/pictures/girls category img 2.png"; // <-- Change Girl's image here
              } else if (category.name.includes("Electric")) {
                imageUrl = "/pictures/electric-category.png"; // <-- Change Electric image here
              } else {
                imageUrl = "/placeholder-bike.png";
              }
            }

            // Next.js requires URL encoding for spaces in local paths
            const safeImageUrl = imageUrl.startsWith('/') ? encodeURI(imageUrl) : imageUrl;

            return (
              <Link 
                href={`/cycles/category/${category.slug}`}
                key={category._id.toString()}
                className="group flex flex-col items-center"
              >
                {/* White Rounded Box */}
                <div className="w-full aspect-[4/3] bg-white rounded-[2rem] md:rounded-[3rem] p-4 flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <div className="relative w-[90%] h-[90%]">
                    <Image 
                      src={safeImageUrl}
                      alt={category.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                
                {/* Category Title & Arrow */}
                <div className="flex items-center gap-2 text-accent group-hover:text-accent-dim transition-colors">
                  <span className="text-sm md:text-base font-normal">{category.name}</span>
                  <span className="text-lg leading-none">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
