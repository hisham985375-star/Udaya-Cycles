/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useUiStore } from "@/store/uiStore";
import Link from "next/link";
import Image from "next/image";

export function SearchOverlay() {
  const { isSearchOpen, toggleSearch } = useUiStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) toggleSearch(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, toggleSearch]);

  // Debounced search
  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.products || []);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-bg/95 backdrop-blur-xl animate-fade-in">
      <div className="container-udaya py-6 flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex-1"></div>
          <button 
            onClick={() => toggleSearch(false)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-raised border border-border hover:text-accent transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-12">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for bicycles, accessories..."
            className="w-full bg-surface border-2 border-border rounded-full py-6 pl-20 pr-8 text-2xl font-display text-text-primary focus:border-accent outline-none placeholder:text-text-muted/50 transition-colors shadow-2xl"
          />
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-12">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-text-muted border-t-accent rounded-full animate-spin"></div>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="text-center py-12 text-text-secondary">
              No products found for &quot;{query}&quot;. Try another search term.
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((product) => (
                <Link 
                  key={product._id} 
                  href={`/products/${product.slug}`}
                  onClick={() => toggleSearch(false)}
                  className="bg-surface-raised border border-border rounded-xl p-4 flex items-center gap-4 group hover:border-accent transition-colors"
                >
                  <div className="w-20 h-20 bg-surface rounded-lg relative overflow-hidden flex-shrink-0">
                    {product.images?.[0]?.url ? (
                      <Image src={product.images[0].url} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                       <span className="absolute inset-0 flex items-center justify-center text-[10px] text-text-muted uppercase tracking-widest">Image</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary group-hover:text-accent transition-colors line-clamp-2 text-sm mb-1">
                      {product.name}
                    </h3>
                    <p className="font-mono font-medium text-text-secondary text-sm">
                      ₹{(product.basePrice / 100).toLocaleString('en-IN')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
