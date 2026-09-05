"use client";

import { useEffect, useState } from "react";
import { useWishlistStore } from "@/store/wishlistStore";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="section-padding bg-bg min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-surface border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="section-padding bg-bg min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center text-red-500/20 mb-6 border border-border">
          <Heart className="w-10 h-10 text-red-500 opacity-50" />
        </div>
        <h1 className="text-3xl font-display font-bold text-text-primary uppercase tracking-tight mb-4">Your Wishlist is Empty</h1>
        <p className="text-text-secondary mb-8 max-w-md">
          Keep track of the cycles and gear you love. Add items to your wishlist to easily find them later.
        </p>
        <Link 
          href="/cycles/category/all"
          className="bg-accent text-bg font-bold px-8 py-4 rounded-full hover:bg-accent-dim hover-scale transition-all tracking-wide uppercase text-sm"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="section-padding bg-bg min-h-screen">
      <div className="container-udaya">
        <div className="flex items-center gap-4 mb-12">
          <Heart className="w-8 h-8 text-red-500 fill-current" />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary uppercase tracking-tight">
            Your <span className="text-text-muted">Wishlist</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.productId} className="bg-surface-raised border border-border rounded-2xl overflow-hidden group hover:border-accent transition-colors flex flex-col">
              <Link href={`/products/${item.slug}`} className="relative aspect-[4/3] block bg-surface overflow-hidden">
                {item.image !== 'placeholder' ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-text-muted text-xs tracking-widest uppercase">No Image</div>
                )}
                {/* Overlay Add to cart hint */}
                <div className="absolute inset-0 bg-bg/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-accent text-bg px-4 py-2 rounded-full font-bold uppercase tracking-wider text-xs flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all">
                    <ShoppingBag className="w-4 h-4" /> View Product
                  </span>
                </div>
              </Link>
              
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-text-primary text-lg mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                    {item.name}
                  </h3>
                  <p className="font-mono font-bold text-text-primary text-xl mb-4">
                    ₹{(item.price / 100).toLocaleString('en-IN')}
                  </p>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    removeItem(item.productId);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-border text-text-secondary hover:text-red-500 hover:border-red-500 hover:bg-red-500/5 transition-all text-sm font-medium uppercase tracking-wider"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
