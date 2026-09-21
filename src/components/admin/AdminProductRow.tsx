"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Edit, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export function AdminProductRow({ product }: { product: any }) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(product.isActive);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = async (newStatus: boolean) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/products/${product._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
      setIsActive(newStatus);
      router.refresh();
    } catch (error: any) {
      alert(error.message);
      // Revert select visually if failed
      setIsActive(isActive); 
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRowClick = (e: React.MouseEvent) => {
    // Prevent navigation if the user clicked an action button
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) {
      return;
    }
    router.push(`/admin/products/${product.slug}`);
  };

  return (
    <tr 
      onClick={handleRowClick}
      className="hover:bg-surface/50 transition-colors group cursor-pointer"
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-md bg-bg border border-border overflow-hidden relative flex-shrink-0 flex items-center justify-center">
            {product.images && product.images.length > 0 ? (
              <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
            ) : (
              <ImageIcon className="w-5 h-5 text-text-muted" />
            )}
          </div>
          <div>
            <div className="font-bold text-text-primary line-clamp-1">{product.name}</div>
            <div className="text-xs text-text-muted font-mono">{product.sku}</div>
          </div>
        </div>
      </td>
      <td className="p-4 text-sm text-text-secondary font-medium">
        {product.brand?.name || "—"}
      </td>
      <td className="p-4 text-sm text-text-secondary font-medium">
        {product.category?.name || "—"}
      </td>
      <td className="p-4 text-sm text-text-secondary font-medium">
        {product.size || "—"}
      </td>
      <td className="p-4">
        <div className="font-mono font-bold text-text-primary">
          ₹{((product.regularPrice || 0) / 100).toLocaleString('en-IN')}
        </div>
      </td>
      <td className="p-4">
        <select
          value={isActive ? "active" : "draft"}
          onChange={(e) => updateStatus(e.target.value === "active")}
          disabled={isUpdating}
          onClick={(e) => e.stopPropagation()}
          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full outline-none appearance-none cursor-pointer text-center ${
            isActive 
              ? "bg-green-500/10 text-green-500 border border-green-500/20" 
              : "bg-text-muted/10 text-text-muted border border-border"
          } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <option value="active" className="text-black">Active</option>
          <option value="draft" className="text-black">Draft</option>
        </select>
      </td>
      <td className="p-4 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link 
            href={`/admin/products/${product.slug}`}
            className="p-2 text-text-secondary hover:text-accent bg-bg rounded-md border border-transparent hover:border-border transition-colors"
            title="Edit"
            onClick={(e) => e.stopPropagation()}
          >
            <Edit className="w-4 h-4" />
          </Link>
          <DeleteProductButton productId={product._id.toString()} />
        </div>
      </td>
    </tr>
  );
}
