"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import Link from "next/link";

interface ProductSearchInputProps {
  initialQuery: string;
}

export function ProductSearchInput({ initialQuery }: ProductSearchInputProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state if URL changes externally
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce the search
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        router.push(`${pathname}?q=${encodeURIComponent(value)}`);
      } else {
        router.push(pathname);
      }
    }, 400); // 400ms debounce
  };

  const handleClear = () => {
    setQuery("");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    router.push(pathname);
  };

  return (
    <div className="relative w-full sm:w-96">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search products..."
        className="w-full bg-bg border border-border rounded-lg py-2 pl-10 pr-10 text-sm text-text-primary focus:border-accent outline-none"
      />
      {query && (
        <button
          onClick={handleClear}
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-error bg-bg rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
