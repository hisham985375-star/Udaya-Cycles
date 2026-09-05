"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Edit,
  ChevronLeft,
  ChevronRight,
  Search,
  Image as ImageIcon,
  CheckSquare2,
  Square,
  CheckCircle,
} from "lucide-react";
import { ImportProductEditModal } from "./ImportProductEditModal";
import { BulkActionsBar } from "./BulkActionsBar";
import { ApproveConfirmModal } from "./ApproveConfirmModal";

interface ImportProduct {
  _id: string;
  extractedName?: string;
  extractedBrand?: { _id: string; name: string } | null;
  extractedBrandRaw?: string;
  extractedCategory?: { _id: string; name: string } | null;
  extractedCategoryRaw?: string;
  extractedSize?: string;
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
  errorMessages?: string[];
}

interface Brand { _id: string; name: string }
interface Category { _id: string; name: string }

interface ImportProductsTableProps {
  jobId: string;
  brands: Brand[];
  categories: Category[];
  readyCount: number;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  PROCESSING: { label: "Processing", icon: Clock, color: "text-text-muted" },
  READY: { label: "Ready", icon: CheckCircle2, color: "text-success" },
  NEEDS_REVIEW: { label: "Needs Review", icon: AlertTriangle, color: "text-warning" },
  FAILED: { label: "Failed", icon: XCircle, color: "text-error" },
  APPROVED: { label: "Approved", icon: CheckCircle, color: "text-[var(--color-info)]" },
  REJECTED: { label: "Rejected", icon: XCircle, color: "text-text-muted" },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PROCESSING!;
  const Icon = config.icon;
  return (
    <span className={`flex items-center gap-1.5 text-xs font-bold ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

function ConfidenceDot({ value, needsReview }: { value: number; needsReview?: boolean }) {
  if (needsReview) return <AlertTriangle className="w-3.5 h-3.5 text-warning" />;
  const color = value >= 85 ? "text-success" : value >= 60 ? "text-warning" : "text-error";
  return <span className={`text-xs font-mono font-bold ${color}`}>{value}%</span>;
}

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "READY", label: "Ready" },
  { id: "NEEDS_REVIEW", label: "Needs Review" },
  { id: "FAILED", label: "Failed" },
  { id: "APPROVED", label: "Approved" },
  { id: "REJECTED", label: "Rejected" },
];

export function ImportProductsTable({
  jobId,
  brands,
  categories,
  readyCount,
}: ImportProductsTableProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<ImportProduct[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingProduct, setEditingProduct] = useState<ImportProduct | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [approveResult, setApproveResult] = useState<{
    created: number; duplicates: number; skipped: number; errors: string[];
  } | null>(null);
  const [initialized, setInitialized] = useState(false);

  const fetchProducts = useCallback(
    async (tabOverride?: string, pageOverride?: number, searchOverride?: string) => {
      setLoading(true);
      try {
        const tab = tabOverride ?? activeTab;
        const pg = pageOverride ?? page;
        const q = searchOverride ?? search;
        const params = new URLSearchParams({
          status: tab,
          page: String(pg),
          limit: "20",
          ...(q ? { search: q } : {}),
        });
        const res = await fetch(`/api/admin/bulk-import/${jobId}/products?${params}`);
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        setProducts(data.products || []);
        setTotalPages(data.pagination?.totalPages || 0);
        setTotal(data.pagination?.total || 0);
        setInitialized(true);
      } finally {
        setLoading(false);
      }
    },
    [jobId, activeTab, page, search]
  );

  // Load on mount
  useState(() => {
    fetchProducts();
  });

  // Also load when not initialized
  if (!initialized && !loading) {
    fetchProducts();
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
    setSelectedIds(new Set());
    fetchProducts(tab, 1);
  };

  const handleSearch = (q: string) => {
    setSearch(q);
    setPage(1);
    fetchProducts(activeTab, 1, q);
  };

  const handlePageChange = (pg: number) => {
    setPage(pg);
    fetchProducts(activeTab, pg);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p._id)));
    }
  };

  const handleBulkAction = async (
    action: string,
    value: Record<string, string>
  ) => {
    if (selectedIds.size === 0) return;
    await fetch(`/api/admin/bulk-import/${jobId}/products`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productIds: Array.from(selectedIds),
        action,
        value,
      }),
    });
    setSelectedIds(new Set());
    fetchProducts();
  };

  const handleApproveAll = async () => {
    setApproveLoading(true);
    try {
      const res = await fetch(`/api/admin/bulk-import/${jobId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approveAll: true }),
      });
      const data = await res.json();
      setApproveResult(data);
      fetchProducts();
    } finally {
      setApproveLoading(false);
    }
  };

  const handleProductSaved = (updated: ImportProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === updated._id ? { ...p, ...updated } : p))
    );
    setEditingProduct(null);
  };

  const allSelected = products.length > 0 && selectedIds.size === products.length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-surface-raised border border-border rounded-2xl overflow-hidden">
        {/* Top bar: search + approve all */}
        <div className="p-4 border-b border-border flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-bg border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-accent outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            {readyCount > 0 && (
              <button
                onClick={() => setShowApproveModal(true)}
                className="bg-accent text-bg font-bold px-5 py-2.5 rounded-full hover:bg-accent-dim transition-colors text-sm flex items-center gap-2 uppercase tracking-wide"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve All Ready ({readyCount})
              </button>
            )}
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex border-b border-border overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="ml-auto px-4 flex items-center text-xs text-text-muted">
            {total} products
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-text-muted bg-surface border-b border-border">
                <th className="p-4 w-10">
                  <button onClick={toggleSelectAll}>
                    {allSelected ? (
                      <CheckSquare2 className="w-4 h-4 text-accent" />
                    ) : (
                      <Square className="w-4 h-4 text-text-muted" />
                    )}
                  </button>
                </th>
                <th className="p-4">Image</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Category</th>
                <th className="p-4">Size</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="spinner mx-auto" />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-text-muted text-sm">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product._id}
                    className={`hover:bg-surface/50 transition-colors group ${
                      selectedIds.has(product._id) ? "bg-accent/5" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-4">
                      <button onClick={() => toggleSelect(product._id)}>
                        {selectedIds.has(product._id) ? (
                          <CheckSquare2 className="w-4 h-4 text-accent" />
                        ) : (
                          <Square className="w-4 h-4 text-text-muted" />
                        )}
                      </button>
                    </td>

                    {/* Image */}
                    <td className="p-4">
                      <div
                        className="w-12 h-12 rounded-lg overflow-hidden relative flex items-center justify-center border border-border"
                        style={{
                          backgroundImage: `linear-gradient(45deg, #2a2a2a 25%, transparent 25%),
                            linear-gradient(-45deg, #2a2a2a 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, #2a2a2a 75%),
                            linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)`,
                          backgroundSize: "8px 8px",
                          backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
                          backgroundColor: "#1a1a18",
                        }}
                      >
                        {product.image?.cloudinaryUrl ? (
                          <Image
                            src={product.image.cloudinaryUrl}
                            alt={product.extractedName || "Product"}
                            width={48}
                            height={48}
                            className="object-contain w-full h-full"
                            unoptimized
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-text-muted" />
                        )}
                        {product.imageNeedsReview && (
                          <AlertTriangle className="absolute top-0.5 right-0.5 w-3 h-3 text-warning" />
                        )}
                      </div>
                    </td>

                    {/* Name */}
                    <td className="p-4 max-w-[220px]">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0">
                          <div
                            className={`font-medium text-sm truncate ${
                              product.extractedName ? "text-text-primary" : "text-text-muted italic"
                            }`}
                          >
                            {product.extractedName || "Unknown"}
                          </div>
                        </div>
                        <ConfidenceDot
                          value={product.nameConfidence}
                          needsReview={product.nameNeedsReview}
                        />
                      </div>
                    </td>

                    {/* Brand */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-text-secondary">
                          {product.extractedBrand?.name || product.extractedBrandRaw || (
                            <span className="text-text-muted italic">—</span>
                          )}
                        </span>
                        <ConfidenceDot
                          value={product.brandConfidence}
                          needsReview={product.brandNeedsReview}
                        />
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-text-secondary">
                          {product.extractedCategory?.name || product.extractedCategoryRaw || (
                            <span className="text-text-muted italic">—</span>
                          )}
                        </span>
                        <ConfidenceDot
                          value={product.categoryConfidence}
                          needsReview={product.categoryNeedsReview}
                        />
                      </div>
                    </td>

                    {/* Size */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-mono ${product.extractedSize ? "text-text-primary font-bold" : "text-text-muted italic"}`}>
                          {product.extractedSize || "—"}
                        </span>
                        {product.sizeNeedsReview && (
                          <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <StatusBadge status={product.status} />
                      {product.errorMessages && product.errorMessages.length > 0 && (
                        <div className="text-[10px] text-error mt-0.5 truncate max-w-[140px]" title={product.errorMessages.join("; ")}>
                          {product.errorMessages[0]}
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-text-secondary hover:text-accent bg-bg border border-transparent hover:border-border rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
              const pg = i + 1;
              return (
                <button
                  key={pg}
                  onClick={() => handlePageChange(pg)}
                  className={`w-9 h-9 rounded-lg border font-mono font-bold text-sm transition-colors ${
                    page === pg
                      ? "bg-accent text-bg border-accent"
                      : "border-border text-text-secondary hover:border-accent hover:text-accent"
                  }`}
                >
                  {pg}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Bulk actions bar */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        brands={brands}
        categories={categories}
        onClearSelection={() => setSelectedIds(new Set())}
        onApprove={() =>
          handleBulkAction("approve", {})
        }
        onReject={() => handleBulkAction("reject", {})}
        onChangeBrand={(brandId, brandName) =>
          handleBulkAction("change_brand", { brandId, brandName })
        }
        onChangeCategory={(categoryId, categoryName) =>
          handleBulkAction("change_category", { categoryId, categoryName })
        }
        onChangeStatus={(status) => handleBulkAction("change_status", { status })}
      />

      {/* Edit modal */}
      {editingProduct && (
        <ImportProductEditModal
          product={editingProduct}
          brands={brands}
          categories={categories}
          jobId={jobId}
          onClose={() => setEditingProduct(null)}
          onSaved={handleProductSaved}
        />
      )}

      {/* Approve all modal */}
      {showApproveModal && (
        <ApproveConfirmModal
          count={readyCount}
          jobId={jobId}
          onConfirm={handleApproveAll}
          onClose={() => {
            setShowApproveModal(false);
            setApproveResult(null);
          }}
          confirming={approveLoading}
          result={approveResult}
        />
      )}
    </div>
  );
}
