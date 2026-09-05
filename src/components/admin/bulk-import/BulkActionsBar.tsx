"use client";

import { X, Tag, Layers, ToggleLeft, CheckSquare, XSquare } from "lucide-react";

interface Brand { _id: string; name: string }
interface Category { _id: string; name: string }

interface BulkActionsBarProps {
  selectedCount: number;
  brands: Brand[];
  categories: Category[];
  onClearSelection: () => void;
  onApprove: () => void;
  onReject: () => void;
  onChangeBrand: (brandId: string, brandName: string) => void;
  onChangeCategory: (categoryId: string, categoryName: string) => void;
  onChangeStatus: (status: string) => void;
}

export function BulkActionsBar({
  selectedCount,
  brands,
  categories,
  onClearSelection,
  onApprove,
  onReject,
  onChangeBrand,
  onChangeCategory,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300]">
      <div className="bg-surface-raised border border-border rounded-2xl shadow-lg px-5 py-4 flex items-center gap-4">
        {/* Count */}
        <div className="flex items-center gap-2">
          <span className="bg-accent text-bg text-xs font-bold px-2.5 py-1 rounded-full min-w-[28px] text-center">
            {selectedCount}
          </span>
          <span className="text-text-secondary text-sm font-medium">selected</span>
          <button
            onClick={onClearSelection}
            className="p-1 text-text-muted hover:text-text-primary transition-colors ml-1"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="h-8 w-px bg-border" />

        {/* Change Brand */}
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-text-muted" />
          <select
            onChange={(e) => {
              const brand = brands.find((b) => b._id === e.target.value);
              if (brand) onChangeBrand(brand._id, brand.name);
              e.target.value = "";
            }}
            className="bg-bg border border-border rounded-lg px-3 py-1.5 text-sm text-text-secondary focus:border-accent outline-none transition-colors"
            defaultValue=""
          >
            <option value="" disabled>Change Brand</option>
            {brands.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Change Category */}
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-text-muted" />
          <select
            onChange={(e) => {
              const cat = categories.find((c) => c._id === e.target.value);
              if (cat) onChangeCategory(cat._id, cat.name);
              e.target.value = "";
            }}
            className="bg-bg border border-border rounded-lg px-3 py-1.5 text-sm text-text-secondary focus:border-accent outline-none transition-colors"
            defaultValue=""
          >
            <option value="" disabled>Change Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="h-8 w-px bg-border" />

        {/* Approve */}
        <button
          onClick={onApprove}
          className="flex items-center gap-2 bg-success/10 border border-success/20 text-success hover:bg-success/20 px-4 py-2 rounded-full text-sm font-bold transition-colors"
        >
          <CheckSquare className="w-4 h-4" />
          Approve Selected
        </button>

        {/* Reject */}
        <button
          onClick={onReject}
          className="flex items-center gap-2 bg-error/10 border border-error/20 text-error hover:bg-error/20 px-4 py-2 rounded-full text-sm font-bold transition-colors"
        >
          <XSquare className="w-4 h-4" />
          Reject Selected
        </button>
      </div>
    </div>
  );
}
