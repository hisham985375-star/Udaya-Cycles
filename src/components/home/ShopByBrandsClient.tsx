"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export function ShopByBrandsClient({ brands }: { brands: any[] }) {
  const [showAll, setShowAll] = useState(false);

  // If showAll is true, show all brands.
  // Otherwise, show the first 10 brands.
  const displayedBrands = showAll ? brands : brands.slice(0, 10);

  return (
    <section className="py-20 bg-black">
      <div className="container-udaya">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <h2 className="text-3xl md:text-4xl font-normal text-accent">
            Cycles by Brand
          </h2>
          {!showAll && brands.length > 10 && (
            <button 
              onClick={() => setShowAll(true)}
              className="text-sm font-bold text-text-primary hover:text-accent transition-colors flex items-center gap-2 uppercase tracking-wide group self-start md:self-auto"
            >
              View More Brands
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
          {displayedBrands.map((brand: any) => {
            return (
              <Link 
                href={brand.href}
                key={brand.id}
                className="group flex flex-col items-center"
              >
                {/* Image Box */}
                <div className="w-full aspect-square bg-[#1a1a1a] rounded-3xl md:rounded-[2.5rem] overflow-hidden relative mb-4 md:mb-6 shadow-sm group-hover:scale-105 transition-transform duration-300">
                  {brand.logo ? (
                    <>
                      {/* Background Image */}
                      {brand.bgImage && (
                        <Image 
                          src={brand.bgImage}
                          alt={brand.label}
                          fill
                          unoptimized
                          className="object-cover opacity-60 mix-blend-overlay group-hover:opacity-80 transition-opacity"
                        />
                      )}
                      
                      {/* Logo overlay */}
                      <div className={`absolute inset-0 flex items-center justify-center ${brand.fillLogo ? '' : 'p-4 md:p-6'} ${brand.bgWhite ? 'bg-white' : ''}`}>
                        <div className={`relative ${brand.fillLogo ? 'w-full h-full' : 'w-3/4 h-20 md:h-24'}`}>
                          <Image
                            src={brand.logo}
                            alt={`${brand.id} logo`}
                            fill
                            unoptimized
                            className={brand.fillLogo ? (brand.bgWhite ? 'object-contain p-4' : 'object-cover') : 'object-contain'}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    // Fallback design for brands without specific images
                    <div className="absolute inset-0 bg-surface-raised flex items-center justify-center p-6 text-center border-2 border-border group-hover:border-accent transition-colors rounded-[2rem] md:rounded-[2.5rem]">
                      <span className="text-xl md:text-2xl font-display font-bold text-text-primary uppercase tracking-wider group-hover:text-accent transition-colors">
                        {brand.label}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Title & Arrow */}
                <div className="flex items-center gap-2 text-accent group-hover:text-accent-dim transition-colors">
                  <span className="text-sm md:text-base font-normal">{brand.label}</span>
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
