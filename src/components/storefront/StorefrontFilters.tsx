"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X, ChevronDown, ChevronUp } from "lucide-react";

interface Brand {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
  slug?: string;
}

interface StorefrontFiltersProps {
  brands: Brand[];
  categories: Category[];
  currentBrandId?: string;
  currentCategoryId?: string;
}

export function StorefrontFilters({ brands, categories, currentBrandId, currentCategoryId }: StorefrontFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [brandId, setBrandId] = useState(searchParams.get("brand") || currentBrandId || "");
  const [categoryId, setCategoryId] = useState(searchParams.get("category") || currentCategoryId || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [size, setSize] = useState(searchParams.get("size") || "");

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync state if URL changes externally
  useEffect(() => {
    setBrandId(searchParams.get("brand") || currentBrandId || "");
    setCategoryId(searchParams.get("category") || currentCategoryId || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setSize(searchParams.get("size") || "");
  }, [searchParams, currentBrandId, currentCategoryId]);

  const updateUrl = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    params.delete("page");

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        if (key === "brand" && value === currentBrandId) {
            params.delete(key);
        } else if (key === "category" && value === currentCategoryId) {
            params.delete(key);
        } else {
            params.set(key, value);
        }
      } else {
        params.delete(key);
      }
    });

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const currentBrand = searchParams.get("brand") || currentBrandId || "";
    const currentCategory = searchParams.get("category") || currentCategoryId || "";
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
        // If they change the brand via query params (though no UI for it currently)
        if (currentBrandId && brandId && brandId !== currentBrandId) {
            const selectedBrand = brands.find(b => b._id === brandId);
            if (selectedBrand) {
                const params = new URLSearchParams();
                if (categoryId) params.set("category", categoryId);
                if (size) params.set("size", size);
                if (minPrice) params.set("minPrice", minPrice);
                if (maxPrice) params.set("maxPrice", maxPrice);
                params.set("brand", brandId);
                router.push(`/cycles/category/all?${params.toString()}`);
                return;
            }
        }

        // If category changed from what the page currently shows
        if (categoryId !== currentCategoryId) {
            const params = new URLSearchParams();
            if (brandId) params.set("brand", brandId);
            if (size) params.set("size", size);
            if (minPrice) params.set("minPrice", minPrice);
            if (maxPrice) params.set("maxPrice", maxPrice);
            
            if (categoryId) {
              const selectedCategory = categories.find(c => c._id === categoryId);
              if (selectedCategory && selectedCategory.slug) {
                 router.push(`/cycles/category/${selectedCategory.slug}?${params.toString()}`);
                 return;
              }
            }
            
            // If clearing category, go to "all"
            router.push(`/cycles/category/all?${params.toString()}`);
            return;
        }

        updateUrl({
          brand: brandId,
          // category param is no longer needed since it's part of the path, but we can keep it if needed.
          size: size,
          minPrice: minPrice,
          maxPrice: maxPrice
        });
      }, 400);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [brandId, categoryId, size, minPrice, maxPrice, searchParams, currentBrandId, currentCategoryId, router]);

  const clearFilters = () => {
    setBrandId(currentBrandId || "");
    setCategoryId(currentCategoryId || "");
    setSize("");
    setMinPrice("");
    setMaxPrice("");
    
    updateUrl({
      brand: "",
      category: "",
      size: "",
      minPrice: "",
      maxPrice: ""
    });
  };

  const hasActiveFilters = (brandId && brandId !== currentBrandId) || 
                           (categoryId && categoryId !== currentCategoryId) || 
                           size || minPrice || maxPrice;


  const getCategoryLabel = () => {
    if (categoryId) {
      const cat = categories.find(c => c._id === categoryId);
      return cat ? cat.name : "Category";
    }
    return "Category";
  };

  const getSizeLabel = () => size || "Size";

  const getPriceLabel = () => {
    if (minPrice && maxPrice) return `₹${minPrice} - ₹${maxPrice}`;
    if (minPrice) return `> ₹${minPrice}`;
    if (maxPrice) return `< ₹${maxPrice}`;
    return "Price Range";
  };

  return (
    <div className="w-full flex justify-start mb-2 animate-fade-in-up z-40 relative">
      <div ref={dropdownRef} className="flex items-center flex-wrap gap-2 bg-surface border border-border rounded-full px-3 py-2 text-sm font-medium shadow-sm w-max max-w-full">
        
        {/* Category */}
        <div className="relative">
          <button 
            onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all duration-200 ${
              (categoryId && categoryId !== currentCategoryId) || openDropdown === 'category'
                ? 'bg-accent text-bg font-bold shadow-sm' 
                : 'hover:bg-surface-raised text-text-primary'
            }`}
          >
            {getCategoryLabel()}
            {openDropdown === 'category' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {openDropdown === 'category' && (
            <div className="absolute top-full mt-2 left-0 min-w-[200px] w-max bg-surface-raised border border-border rounded-xl shadow-xl z-50 py-2 flex flex-col max-h-64 overflow-y-auto">
               <button 
                 onClick={() => { setCategoryId(""); setOpenDropdown(null); }} 
                 className={`text-left px-4 py-2 hover:bg-surface transition-colors ${!categoryId ? 'text-accent font-bold' : 'text-text-primary'}`}
               >
                 All Categories
               </button>
               {categories.map(c => (
                 <button 
                   key={c._id} 
                   onClick={() => { setCategoryId(c._id); setOpenDropdown(null); }} 
                   className={`text-left px-4 py-2 hover:bg-surface transition-colors ${categoryId === c._id ? 'text-accent font-bold' : 'text-text-primary'}`}
                 >
                   {c.name}
                 </button>
               ))}
            </div>
          )}
        </div>

        <span className="text-text-muted/50 font-light select-none">/</span>

        {/* Size */}
        <div className="relative">
          <button 
            onClick={() => setOpenDropdown(openDropdown === 'size' ? null : 'size')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all duration-200 ${
              size || openDropdown === 'size'
                ? 'bg-accent text-bg font-bold shadow-sm' 
                : 'hover:bg-surface-raised text-text-primary'
            }`}
          >
            {getSizeLabel()}
            {openDropdown === 'size' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {openDropdown === 'size' && (
            <div className="absolute top-full mt-2 left-0 min-w-[150px] bg-surface-raised border border-border rounded-xl shadow-xl z-50 py-2 flex flex-col max-h-64 overflow-y-auto">
               <button 
                 onClick={() => { setSize(""); setOpenDropdown(null); }} 
                 className={`text-left px-4 py-2 hover:bg-surface transition-colors ${!size ? 'text-accent font-bold' : 'text-text-primary'}`}
               >
                 All Sizes
               </button>
               {['12', '14', '16', '20', '24', '26', '27.5', '29', '700C'].map(s => (
                 <button 
                   key={s} 
                   onClick={() => { setSize(s); setOpenDropdown(null); }} 
                   className={`text-left px-4 py-2 hover:bg-surface transition-colors ${size === s ? 'text-accent font-bold' : 'text-text-primary'}`}
                 >
                   {s}
                 </button>
               ))}
            </div>
          )}
        </div>

        <span className="text-text-muted/50 font-light select-none">/</span>

        {/* Price Range */}
        <div className="relative">
          <button 
            onClick={() => setOpenDropdown(openDropdown === 'price' ? null : 'price')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all duration-200 ${
              minPrice || maxPrice || openDropdown === 'price'
                ? 'bg-accent text-bg font-bold shadow-sm' 
                : 'hover:bg-surface-raised text-text-primary'
            }`}
          >
            {getPriceLabel()}
            {openDropdown === 'price' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {openDropdown === 'price' && (
            <div className="absolute top-full mt-2 left-0 w-[280px] sm:w-[320px] bg-surface-raised border border-border rounded-xl shadow-xl z-50 p-4 flex flex-col gap-4">
               <div className="flex flex-col gap-1.5">
                 <label className="text-xs font-bold text-text-secondary uppercase">Custom Range (₹)</label>
                 <div className="flex items-center gap-2">
                   <input 
                     type="number" 
                     placeholder="Min" 
                     value={minPrice} 
                     onChange={e => setMinPrice(e.target.value)} 
                     className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:border-accent outline-none" 
                   />
                   <span className="text-text-muted">-</span>
                   <input 
                     type="number" 
                     placeholder="Max" 
                     value={maxPrice} 
                     onChange={e => setMaxPrice(e.target.value)} 
                     className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:border-accent outline-none" 
                   />
                 </div>
               </div>
               <div className="flex justify-between items-center pt-2 border-t border-border">
                 <button 
                   onClick={() => { setMinPrice(""); setMaxPrice(""); }} 
                   className="text-xs text-text-muted hover:text-error transition-colors"
                 >
                   Clear
                 </button>
                 <button 
                   onClick={() => setOpenDropdown(null)} 
                   className="text-xs font-bold text-bg bg-accent px-4 py-1.5 rounded-full hover:bg-accent-dim transition-colors"
                 >
                   Apply
                 </button>
               </div>
            </div>
          )}
        </div>

        {hasActiveFilters && (
          <>
            <span className="text-text-muted/50 font-light select-none">/</span>
            <button 
              onClick={clearFilters} 
              className="p-1.5 hover:bg-error/10 hover:text-error text-text-secondary rounded-full transition-colors ml-1"
              title="Clear all filters"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}

      </div>
    </div>
  );
}
