"use client";

import { useState } from "react";
import { X, Save, Upload, AlertTriangle } from "lucide-react";
import { ImagePreviewTabs } from "./ImagePreviewTabs";
import Image from "next/image";

interface ImportProduct {
  _id: string;
  extractedName?: string;
  extractedBrand?: { _id: string; name: string } | null;
  extractedBrandRaw?: string;
  extractedCategory?: { _id: string; name: string } | null;
  extractedCategoryRaw?: string;
  extractedSize?: string;
  extractedSku?: string;
  extractedDescription?: string;
  nameConfidence: number;
  brandConfidence: number;
  categoryConfidence: number;
  sizeConfidence: number;
  imageConfidence: number;
  nameNeedsReview: boolean;
  brandNeedsReview: boolean;
  categoryNeedsReview: boolean;
  sizeNeedsReview: boolean;
  imageNeedsReview: boolean;
  image?: {
    cloudinaryUrl?: string;
    cloudinaryPublicId?: string;
    qualityIssues?: string[];
    extractionMethod?: string;
  };
  status: string;
  reviewNotes?: string;
}

interface Brand { _id: string; name: string }
interface Category { _id: string; name: string }

interface ImportProductEditModalProps {
  product: ImportProduct;
  brands: Brand[];
  categories: Category[];
  jobId: string;
  onClose: () => void;
  onSaved: (updated: ImportProduct) => void;
}

function ConfidenceBadge({ value }: { value: number }) {
  const color =
    value >= 85 ? "text-success bg-success/10" :
    value >= 60 ? "text-warning bg-warning/10" :
    "text-error bg-error/10";

  return (
    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${color}`}>
      {value}%
    </span>
  );
}

function ReviewFlag() {
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-warning">
      <AlertTriangle className="w-3 h-3" /> REVIEW
    </span>
  );
}

export function ImportProductEditModal({
  product,
  brands,
  categories,
  jobId,
  onClose,
  onSaved,
}: ImportProductEditModalProps) {
  const [form, setForm] = useState({
    extractedName: product.extractedName || "",
    extractedBrand: product.extractedBrand?._id || "",
    extractedBrandRaw: product.extractedBrandRaw || "",
    extractedCategory: product.extractedCategory?._id || "",
    extractedCategoryRaw: product.extractedCategoryRaw || "",
    extractedSize: product.extractedSize || "",
    extractedSku: product.extractedSku || "",
    extractedDescription: product.extractedDescription || "",
    status: product.status,
    reviewNotes: product.reviewNotes || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const SIZE_OPTIONS = ["26T", "27.5T", "29T", "24T", "20T", "16T", "700C", "S", "M", "L", "XL"];
  const STATUS_OPTIONS = ["READY", "NEEDS_REVIEW", "REJECTED"];

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const selectedBrand = brands.find(b => b._id === form.extractedBrand);
      const selectedCategory = categories.find(c => c._id === form.extractedCategory);

      const res = await fetch(`/api/admin/bulk-import/${jobId}/products/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          extractedBrandRaw: selectedBrand?.name || form.extractedBrandRaw,
          extractedCategoryRaw: selectedCategory?.name || form.extractedCategoryRaw,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Save failed");
      }

      const data = await res.json();
      onSaved(data.product);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface-raised border border-border rounded-2xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-text-primary font-display">
            Edit Imported Product
          </h2>
          <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-5 grid grid-cols-[1fr_220px] gap-6">
            {/* Left: form */}
            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Product Name
                  </label>
                  <ConfidenceBadge value={product.nameConfidence} />
                  {product.nameNeedsReview && <ReviewFlag />}
                </div>
                <input
                  value={form.extractedName}
                  onChange={(e) => setForm({ ...form, extractedName: e.target.value })}
                  className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-accent outline-none transition-colors"
                  placeholder="Product name..."
                />
              </div>

              {/* Brand */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Brand
                  </label>
                  <ConfidenceBadge value={product.brandConfidence} />
                  {product.brandNeedsReview && <ReviewFlag />}
                </div>
                <select
                  value={form.extractedBrand}
                  onChange={(e) => setForm({ ...form, extractedBrand: e.target.value })}
                  className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-accent outline-none transition-colors"
                >
                  <option value="">— Select Brand —</option>
                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                {product.extractedBrandRaw && !form.extractedBrand && (
                  <p className="text-xs text-text-muted mt-1">
                    Detected: &ldquo;{product.extractedBrandRaw}&rdquo; — no brand match found
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Category
                  </label>
                  <ConfidenceBadge value={product.categoryConfidence} />
                  {product.categoryNeedsReview && <ReviewFlag />}
                </div>
                <select
                  value={form.extractedCategory}
                  onChange={(e) => setForm({ ...form, extractedCategory: e.target.value })}
                  className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-accent outline-none transition-colors"
                >
                  <option value="">— Select Category —</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Size
                  </label>
                  <ConfidenceBadge value={product.sizeConfidence} />
                  {product.sizeNeedsReview && <ReviewFlag />}
                </div>
                <div className="flex gap-2">
                  <select
                    value={form.extractedSize}
                    onChange={(e) => setForm({ ...form, extractedSize: e.target.value })}
                    className="flex-1 bg-bg border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-accent outline-none transition-colors"
                  >
                    <option value="">— No Size —</option>
                    {SIZE_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <input
                    value={form.extractedSize}
                    onChange={(e) => setForm({ ...form, extractedSize: e.target.value })}
                    placeholder="Custom..."
                    className="w-28 bg-bg border border-border rounded-lg px-3 py-2.5 text-text-primary focus:border-accent outline-none transition-colors"
                  />
                </div>
              </div>

              {/* SKU */}
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1 block">
                  SKU (optional)
                </label>
                <input
                  value={form.extractedSku}
                  onChange={(e) => setForm({ ...form, extractedSku: e.target.value })}
                  placeholder="Auto-generated if empty"
                  className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text-primary font-mono focus:border-accent outline-none transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1 block">
                  Description
                </label>
                <textarea
                  value={form.extractedDescription}
                  onChange={(e) => setForm({ ...form, extractedDescription: e.target.value })}
                  rows={3}
                  className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-accent outline-none transition-colors resize-none"
                  placeholder="Product description..."
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1 block">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-accent outline-none transition-colors"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Review Notes */}
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1 block">
                  Review Notes
                </label>
                <textarea
                  value={form.reviewNotes}
                  onChange={(e) => setForm({ ...form, reviewNotes: e.target.value })}
                  rows={2}
                  className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text-primary focus:border-accent outline-none transition-colors resize-none text-sm"
                  placeholder="Internal notes..."
                />
              </div>
            </div>

            {/* Right: image */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Product Image
                  </label>
                  <ConfidenceBadge value={product.imageConfidence} />
                  {product.imageNeedsReview && <ReviewFlag />}
                </div>

                <ImagePreviewTabs
                  imageUrl={product.image?.cloudinaryUrl}
                  alt={product.extractedName}
                  size={200}
                />

                {product.image?.qualityIssues && product.image.qualityIssues.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {product.image.qualityIssues.map((issue) => (
                      <div
                        key={issue}
                        className="text-[10px] text-warning bg-warning/10 border border-warning/20 px-2 py-1 rounded flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        {issue.replace(/_/g, " ")}
                      </div>
                    ))}
                  </div>
                )}

                {product.image?.extractionMethod && (
                  <p className="text-[10px] text-text-muted mt-1">
                    Method: {product.image.extractionMethod}
                  </p>
                )}

                <button
                  className="mt-3 w-full flex items-center justify-center gap-2 text-sm border border-border hover:border-accent text-text-secondary hover:text-accent px-4 py-2 rounded-lg transition-colors"
                  onClick={() => alert("Image replacement: Upload a transparent PNG via the Cloudinary upload widget")}
                >
                  <Upload className="w-4 h-4" />
                  Replace Image
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border flex items-center justify-between shrink-0">
          {error && <p className="text-error text-sm">{error}</p>}
          {!error && <span />}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-sm border border-border text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-full text-sm bg-accent text-bg font-bold hover:bg-accent-dim transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
