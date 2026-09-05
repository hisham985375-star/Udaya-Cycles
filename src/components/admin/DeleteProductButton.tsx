"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export function DeleteProductButton({ productId }: { productId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete product");
      }

      toast.success("Product deleted successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className={`p-2 text-text-secondary hover:text-error bg-bg rounded-md border border-transparent hover:border-error/20 transition-colors ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
      title="Delete"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
