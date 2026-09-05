/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, AlertTriangle } from "lucide-react";

export function InventoryClient({ initialInventory }: { initialInventory: any[] }) {
  const router = useRouter();
  const [inventory, setInventory] = useState(initialInventory);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // We track changes to send only modified items to the server
  const [modifiedMap, setModifiedMap] = useState<Record<string, { _id: string, isVariant: boolean, stock: number }>>({});

  const handleStockChange = (id: string, isVariant: boolean, newStock: string) => {
    const stockNum = parseInt(newStock) || 0;

    // Update local state for immediate UI reflection
    setInventory(prev => prev.map(item => {
      if (!isVariant && item._id === id) {
        return { ...item, stock: stockNum };
      }
      if (item.hasVariants) {
        const newVariants = item.variants.map((v: any) => v._id === id ? { ...v, stock: stockNum } : v);
        return { ...item, variants: newVariants };
      }
      return item;
    }));

    // Add to modified map
    setModifiedMap(prev => ({
      ...prev,
      [id]: { _id: id, isVariant, stock: stockNum }
    }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;
    
    setLoading(true);
    try {
      const updates = Object.values(modifiedMap);
      const res = await fetch("/api/admin/inventory/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates })
      });

      if (!res.ok) throw new Error("Failed to update inventory");
      
      alert("Inventory updated successfully!");
      setModifiedMap({});
      setHasChanges(false);
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary uppercase tracking-tight">Inventory Management</h1>
          <p className="text-text-secondary text-sm">Rapidly view and edit stock quantities across all products.</p>
        </div>
        <button 
          type="submit"
          disabled={!hasChanges || loading}
          className="bg-accent text-bg font-bold px-6 py-3 rounded-full hover:bg-accent-dim transition-colors flex items-center gap-2 uppercase tracking-wide text-sm disabled:opacity-50 disabled:bg-surface disabled:text-text-muted"
        >
          <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {hasChanges && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex items-center gap-3 text-accent text-sm font-bold uppercase tracking-wide">
          <AlertTriangle className="w-5 h-5" />
          You have unsaved inventory changes.
        </div>
      )}

      <div className="bg-surface-raised border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border text-text-secondary uppercase tracking-widest text-xs bg-surface/50">
              <th className="p-4 font-bold">Product / Variant</th>
              <th className="p-4 font-bold w-48">SKU</th>
              <th className="p-4 font-bold w-48 text-right">Stock Quantity</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <React.Fragment key={item._id}>
                {/* Base Product Row */}
                <tr className="border-b border-border/50 bg-bg">
                  <td className="p-4 font-medium text-text-primary">{item.name}</td>
                  <td className="p-4 font-mono text-text-secondary text-xs">{item.sku}</td>
                  <td className="p-4 text-right">
                    {item.hasVariants ? (
                      <span className="text-xs text-text-muted italic">Managed by variants</span>
                    ) : (
                      <input 
                        type="number" 
                        min="0"
                        value={item.stock}
                        onChange={(e) => handleStockChange(item._id, false, e.target.value)}
                        className={`w-24 bg-surface border rounded p-2 text-right font-mono outline-none transition-colors ${modifiedMap[item._id] ? 'border-accent text-accent bg-accent/10' : 'border-border focus:border-text-primary'}`}
                      />
                    )}
                  </td>
                </tr>
                {/* Variant Rows */}
                {item.hasVariants && item.variants.map((v: any) => (
                  <tr key={v._id} className="border-b border-border/10 bg-surface/20">
                    <td className="p-4 pl-12 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full border border-text-muted"></div>
                      <span className="text-text-secondary">{v.name}</span>
                    </td>
                    <td className="p-4 font-mono text-text-muted text-xs">{v.sku}</td>
                    <td className="p-4 text-right">
                      <input 
                        type="number" 
                        min="0"
                        value={v.stock}
                        onChange={(e) => handleStockChange(v._id, true, e.target.value)}
                        className={`w-24 bg-bg border rounded p-2 text-right font-mono outline-none transition-colors ${modifiedMap[v._id] ? 'border-accent text-accent bg-accent/10' : 'border-border focus:border-text-primary'}`}
                      />
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
            {inventory.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-text-muted">No products found in inventory.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </form>
  );
}
