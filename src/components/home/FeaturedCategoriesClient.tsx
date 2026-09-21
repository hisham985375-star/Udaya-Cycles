"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export function FeaturedCategoriesClient({ categories }: { categories: any[] }) {
  const [showAll, setShowAll] = useState(false);

  const filteredCategories = categories.filter(c => !c.name.toLowerCase().includes("hybrid"));
  const displayedCategories = showAll ? filteredCategories : filteredCategories.slice(0, 4);

  return (
    <section className="py-20 bg-black">
      <div className="container-udaya relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <h2 className="text-3xl md:text-4xl font-normal text-accent">
            Cycles by Category
          </h2>
          {!showAll && categories.length > 4 && (
            <button 
              onClick={() => setShowAll(true)}
              className="text-sm font-bold text-text-primary hover:text-accent transition-colors flex items-center gap-2 uppercase tracking-wide group self-start md:self-auto"
            >
              View More Categories
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          )}
        </div>

        <div className={
          showAll 
            ? "flex overflow-x-auto snap-x gap-4 md:gap-6 lg:gap-8 pb-8 custom-scrollbar scroll-smooth" 
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        }>
          {displayedCategories.map((category: any) => {
            let imageUrl = category.image?.url;
            
            if (!imageUrl) {
              if (category.name.includes("MTB") || category.name.includes("Mountain")) {
                imageUrl = "/pictures/mtb category img.png";
              } else if (category.name.includes("Kids")) {
                imageUrl = "/pictures/kids category img.png";
              } else if (category.name.includes("Girl") || category.name.includes("Ladies")) {
                imageUrl = "/pictures/girls category img 2.png";
              } else if (category.name.includes("Electric")) {
                imageUrl = "/pictures/electric-category.png";
              } else if (category.name.includes("City")) {
                imageUrl = "/pictures/viva-bg.png"; // Fallback image for city
              } else if (category.name.includes("Hybrid")) {
                imageUrl = "/pictures/hybrid-category.png";
              } else {
                imageUrl = "/placeholder-bike.png";
              }
            }

            const safeImageUrl = imageUrl;

            return (
              <Link 
                href={`/cycles/category/${category.slug}`}
                key={category._id.toString()}
                className={`group flex flex-col items-center ${showAll ? 'shrink-0 w-[240px] md:w-[280px] snap-start' : ''}`}
              >
                {/* White Rounded Box */}
                <div className="w-full aspect-[4/3] bg-white rounded-3xl md:rounded-[3rem] p-3 md:p-4 flex items-center justify-center mb-4 md:mb-6 shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <div className="relative w-[90%] h-[90%]">
                    <Image 
                      src={safeImageUrl}
                      alt={category.name}
                      fill
                      unoptimized
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
