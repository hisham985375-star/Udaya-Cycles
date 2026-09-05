"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, Filter } from "lucide-react";

interface Brand {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
}

interface AdminProductFiltersProps {
  brands: Brand[];
  categories: Category[];
}

export function AdminProductFilters({ brands, categories }: AdminProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [brandId, setBrandId] = useState(searchParams.get("brand") || "");
  const [categoryId, setCategoryId] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [size, setSize] = useState(searchParams.get("size") || "");
  
  const [showFilters, setShowFilters] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state if URL changes externally
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setBrandId(searchParams.get("brand") || "");
    setCategoryId(searchParams.get("category") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setSize(searchParams.get("size") || "");
  }, [searchParams]);

  const updateUrl = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Always reset page to 1 on new filter
    params.delete("page");

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      updateUrl({ q: value });
    }, 400);
  };

  const handleClearQuery = () => {
    setQuery("");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    updateUrl({ q: "" });
  };

  useEffect(() => {
    const currentBrand = searchParams.get("brand") || "";
    const currentCategory = searchParams.get("category") || "";
    const currentMin = searchParams.get("minPrice") || "";
    const currentMax = searchParams.get("maxPrice") || "";
    const currentSize = searchParams.get("size") || "";

    if (
      brandId !== currentBrand ||
      categoryId !== currentCategory ||
      minPrice !== currentMin ||
      maxPrice !== currentMax ||
      size !== currentSize
    ) {
      const timeout = setTimeout(() => {
        updateUrl({
          brand: brandId,
          category: categoryId,
          size: size,
          minPrice: minPrice,
          maxPrice: maxPrice
        });
      }, 400);
      return () => clearTimeout(timeout);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId, categoryId, size, minPrice, maxPrice, searchParams]);

  const clearFilters = () => {
    setBrandId("");
    setCategoryId("");
    setSize("");
    setMinPrice("");
    setMaxPrice("");
    
    // Clear url params
    updateUrl({
      brand: "",
      category: "",
      size: "",
      minPrice: "",
      maxPrice: ""
    });
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search products..."
            className="w-full bg-bg border border-border rounded-lg py-2 pl-10 pr-10 text-sm text-text-primary focus:border-accent outline-none transition-colors"
          />
          {query && (
            <button
              onClick={handleClearQuery}
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-error bg-bg rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
            showFilters || brandId || categoryId || size || minPrice || maxPrice 
              ? "bg-accent/10 border-accent text-accent" 
              : "bg-bg border-border text-text-secondary hover:border-accent hover:text-accent"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="bg-bg border border-border rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 animate-fade-in-up">
          
          {/* Brand Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase">Brand</label>
            <select 
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:border-accent outline-none"
            >
              <option value="">All Brands</option>
              {brands.map(b => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase">Category</label>
            <select 
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:border-accent outline-none"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Size Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase">Size</label>
            <select 
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:border-accent outline-none"
            >
              <option value="">All Sizes</option>
              <option value="12">12</option>
              <option value="14">14</option>
              <option value="16">16</option>
              <option value="20">20</option>
              <option value="24">24</option>
              <option value="26">26</option>
              <option value="27.5">27.5</option>
              <option value="29">29</option>
              <option value="700C">700C</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-text-secondary uppercase">Price Range (₹)</label>
            <div className="flex items-center gap-2">
              <input 
                type="number"
                min="0"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:border-accent outline-none"
              />
              <span className="text-text-muted">-</span>
              <input 
                type="number"
                min="0"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:border-accent outline-none"
              />

              {(brandId || categoryId || size || minPrice || maxPrice) && (
                <button 
                  onClick={clearFilters}
                  className="bg-surface border border-border text-text-secondary hover:text-error px-3 py-2 rounded-md text-sm transition-colors"
                  title="Clear Filters"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
