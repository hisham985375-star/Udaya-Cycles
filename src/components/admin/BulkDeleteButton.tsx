"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

export function BulkDeleteButton({ count }: { count: number }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleBulkDelete = async () => {
    if (count === 0) {
      toast.error("No products to delete.");
      return;
    }

    if (!confirm(`DANGER: Are you sure you want to delete ${count} products matching the current filters? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const qs = searchParams.toString();
      const res = await fetch(`/api/admin/products${qs ? `?${qs}` : ''}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to bulk delete products");
      }

      const data = await res.json();
      toast.success(`Successfully deleted ${data.count} products.`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to bulk delete products");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleBulkDelete}
      disabled={isDeleting || count === 0}
      className={`bg-error text-white font-bold px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 uppercase tracking-wide text-xs ${isDeleting || count === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
      title="Delete all matching products"
    >
      <Trash2 className="w-4 h-4" /> Delete All ({count})
    </button>
  );
}
