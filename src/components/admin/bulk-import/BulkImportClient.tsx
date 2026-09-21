"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardType,
  Play,
  AlertCircle,
  Settings,
  CheckCircle2,
  Trash2
} from "lucide-react";

interface Brand { _id: string; name: string }
interface Category { _id: string; name: string }

interface ParsedProduct {
  id: string;
  name: string;
  categoryName: string;
  size: string;
}

interface ImportSettings {
  defaultProductType: "cycle" | "accessory";
  defaultBrandId: string;
  regularPrice: string;
  salePrice: string;
  stockQuantity: string;
}

interface BulkImportClientProps {
  brands: Brand[];
  categories: Category[];
}

export function BulkImportClient({ brands, categories }: BulkImportClientProps) {
  const router = useRouter();
  
  const [pastedText, setPastedText] = useState("");
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [settings, setSettings] = useState<ImportSettings>({
    defaultProductType: "cycle",
    defaultBrandId: "",
    regularPrice: "",
    salePrice: "",
    stockQuantity: "10",
  });
  
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Parse text when pasted or typed
  const handleTextChange = (text: string) => {
    setPastedText(text);
    
    if (!text.trim()) {
      setParsedProducts([]);
      return;
    }

    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const parsed: ParsedProduct[] = [];

    lines.forEach((line, index) => {
      // Try splitting by pipe first (markdown/terminal tables)
      let cols: string[] = [];
      if (line.includes('|')) {
        cols = line.split('|').map(c => c.trim()).filter(c => c.length > 0);
      } else if (line.includes('\t')) {
        // Try splitting by tab (Excel)
        cols = line.split('\t').map(c => c.trim());
      } else {
        // Fallback to comma
        cols = line.split(',').map(c => c.trim());
      }
      
      // If we have at least 2 columns, assume Name, Category, [Size]
      if (cols.length >= 2) {
        parsed.push({
          id: `prod-${Date.now()}-${index}`,
          name: cols[0]?.trim() || "Unknown",
          categoryName: cols[1]?.trim() || "Unknown",
          size: cols[2]?.trim() || "",
        });
      } else {
        // Just name
        parsed.push({
          id: `prod-${Date.now()}-${index}`,
          name: cols[0]?.trim() || "Unknown",
          categoryName: "",
          size: "",
        });
      }
    });

    setParsedProducts(parsed);
    setError(null);
  };

  const removeProduct = (id: string) => {
    setParsedProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleImport = async () => {
    if (parsedProducts.length === 0) {
      setError("Please paste some products first.");
      return;
    }

    setIsImporting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/bulk-import/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: parsedProducts.map(p => ({
            name: p.name,
            categoryName: p.categoryName,
            size: p.size
          })),
          settings
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to import products");
      }

      setSuccess(`Successfully imported ${data.importedCount} products!`);
      setPastedText("");
      setParsedProducts([]);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Settings Section */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-sm">
            1
          </div>
          <h2 className="text-lg font-bold text-text-primary font-display">Global Settings</h2>
        </div>

        <div className="bg-surface-raised border border-border rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            
            <div className="lg:col-span-1">
              <label className="block text-sm font-bold text-text-primary mb-1">Product Type</label>
              <select
                value={settings.defaultProductType}
                onChange={(e) => setSettings({ ...settings, defaultProductType: e.target.value as "cycle" | "accessory" })}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:border-accent outline-none transition-colors"
                style={{ backgroundColor: "#0f0f11", color: "#fff", colorScheme: "dark" }}
              >
                <option value="cycle">Cycle</option>
                <option value="accessory">Accessory</option>
              </select>
            </div>

            <div className="lg:col-span-1">
              <label className="block text-sm font-bold text-text-primary mb-1">Default Brand</label>
              <select
                value={settings.defaultBrandId}
                onChange={(e) => setSettings({ ...settings, defaultBrandId: e.target.value })}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:border-accent outline-none transition-colors"
                style={{ backgroundColor: "#0f0f11", color: "#fff", colorScheme: "dark" }}
              >
                <option value="">No Brand</option>
                {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>

            <div className="lg:col-span-1">
              <label className="block text-sm font-bold text-text-primary mb-1">Reg. Price (₹)</label>
              <input
                type="number"
                value={settings.regularPrice}
                onChange={(e) => setSettings({ ...settings, regularPrice: e.target.value })}
                placeholder="Optional"
                className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm focus:border-accent outline-none transition-colors"
              />
            </div>
            
            <div className="lg:col-span-1">
              <label className="block text-sm font-bold text-text-primary mb-1">Sale Price (₹)</label>
              <input
                type="number"
                value={settings.salePrice}
                onChange={(e) => setSettings({ ...settings, salePrice: e.target.value })}
                placeholder="Optional"
                className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm focus:border-accent outline-none transition-colors"
              />
            </div>

            <div className="lg:col-span-1">
              <label className="block text-sm font-bold text-text-primary mb-1">Stock</label>
              <input
                type="number"
                value={settings.stockQuantity}
                onChange={(e) => setSettings({ ...settings, stockQuantity: e.target.value })}
                placeholder="10"
                className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm focus:border-accent outline-none transition-colors"
              />
            </div>

          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Paste Area Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-sm">
              2
            </div>
            <h2 className="text-lg font-bold text-text-primary font-display">Paste Data</h2>
          </div>
          
          <div className="bg-surface-raised border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3 text-text-muted text-sm">
              <ClipboardType className="w-4 h-4" />
              <span>Format: <strong>Name</strong>, <strong>Category</strong>, <strong>Size</strong> (or copy-paste from Excel)</span>
            </div>
            <textarea
              value={pastedText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Example:&#10;Atlas Gold, Mountain Bike, 26&#34;&#10;Hero Sprint, Hybrid, 28&#34;"
              className="w-full h-[400px] bg-bg border border-border rounded-xl p-4 text-sm font-mono focus:border-accent outline-none resize-none placeholder:text-text-muted/50 transition-colors"
            />
          </div>
        </section>

        {/* Preview Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-sm">
              3
            </div>
            <h2 className="text-lg font-bold text-text-primary font-display flex items-center justify-between w-full">
              <span>Preview & Import</span>
              {parsedProducts.length > 0 && (
                <span className="bg-accent/10 text-accent text-xs px-3 py-1 rounded-full border border-accent/20">
                  {parsedProducts.length} detected
                </span>
              )}
            </h2>
          </div>

          <div className="bg-surface-raised border border-border rounded-2xl flex flex-col h-[456px]">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-3 p-4 border-b border-border bg-surface text-xs font-bold text-text-secondary uppercase tracking-wider rounded-t-2xl">
              <div className="col-span-5">Name</div>
              <div className="col-span-4">Category</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-1 text-right"></div>
            </div>
            
            {/* Table Body */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {parsedProducts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-text-muted">
                  <ClipboardType className="w-8 h-8 mb-2 opacity-50" />
                  <p>Paste data to see preview</p>
                </div>
              ) : (
                parsedProducts.map((p) => (
                  <div key={p.id} className="grid grid-cols-12 gap-3 p-2 items-center hover:bg-surface rounded-lg transition-colors group text-sm">
                    <div className="col-span-5 font-medium text-text-primary truncate" title={p.name}>{p.name}</div>
                    <div className="col-span-4 text-text-secondary truncate" title={p.categoryName}>{p.categoryName}</div>
                    <div className="col-span-2 text-text-secondary truncate">{p.size}</div>
                    <div className="col-span-1 flex justify-end">
                      <button onClick={() => removeProduct(p.id)} className="text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Import Button */}
            <div className="p-4 border-t border-border bg-surface rounded-b-2xl">
              {error && (
                <div className="mb-4 flex items-center gap-2 text-sm text-error bg-error/10 border border-error/20 rounded-lg px-4 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 flex items-center gap-2 text-sm text-success bg-success/10 border border-success/20 rounded-lg px-4 py-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {success}
                </div>
              )}
              <button
                onClick={handleImport}
                disabled={parsedProducts.length === 0 || isImporting}
                className="w-full flex items-center justify-center gap-3 bg-accent text-bg font-bold px-6 py-4 rounded-xl hover:bg-accent-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-bg/40 border-t-bg rounded-full animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    Import {parsedProducts.length} Products
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
