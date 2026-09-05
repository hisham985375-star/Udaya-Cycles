"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  X,
  Settings,
  Play,
  AlertCircle,
  CheckCircle2,
  Tag,
  Layers,
} from "lucide-react";
import { startBulkImportAction } from "@/actions/bulk-import.actions";

interface Brand { _id: string; name: string }
interface Category { _id: string; name: string }

interface UploadedFile {
  file: File;
  id: string;
  brandId: string;
  categoryId: string;
}

interface ImportSettings {
  extractImages: boolean;
  attemptBackgroundRemoval: boolean;
  convertToPng: boolean;
  uploadToCloudinary: boolean;
  defaultProductType: "cycle" | "accessory";
}

interface BulkImportClientProps {
  brands: Brand[];
  categories: Category[];
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function BulkImportClient({ brands, categories }: BulkImportClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [settings, setSettings] = useState<ImportSettings>({
    extractImages: true,
    attemptBackgroundRemoval: true,
    convertToPng: true,
    uploadToCloudinary: true,
    defaultProductType: "cycle",
  });
  const [starting, setStarting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const newFiles: UploadedFile[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        errors.push(`"${file.name}" is not a PDF file`);
        return;
      }
      const maxSize = 200 * 1024 * 1024; // 200MB
      if (file.size > maxSize) {
        errors.push(`"${file.name}" exceeds 200MB limit`);
        return;
      }
      // Check duplicate
      const exists = uploadedFiles.some((u) => u.file.name === file.name && u.file.size === file.size);
      if (exists) {
        errors.push(`"${file.name}" already added`);
        return;
      }
      newFiles.push({
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        brandId: "",
        categoryId: "",
      });
    });

    setValidationErrors(errors);
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  }, [uploadedFiles]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFileAssignment = (id: string, field: "brandId" | "categoryId", value: string) => {
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const handleStartImport = async () => {
    if (uploadedFiles.length === 0) {
      setValidationErrors(["Please add at least one PDF file"]);
      return;
    }

    setStarting(true);
    setValidationErrors([]);

    try {
      const formData = new FormData();

      // Append all files
      for (const { file } of uploadedFiles) {
        formData.append("files", file);
      }

      // Append settings
      formData.append("settings", JSON.stringify(settings));

      // Append per-file assignments
      const fileAssignments: Record<string, { brandId?: string; categoryId?: string }> = {};
      for (const { file, brandId, categoryId } of uploadedFiles) {
        if (brandId || categoryId) {
          fileAssignments[file.name] = {
            ...(brandId ? { brandId } : {}),
            ...(categoryId ? { categoryId } : {}),
          };
        }
      }
      formData.append("fileAssignments", JSON.stringify(fileAssignments));

      const res = await startBulkImportAction(formData);

      if (!res.success) {
        throw new Error(res.error || "Failed to start import");
      }

      router.push(`/admin/products/bulk-import/${res.jobId}`);
    } catch (err) {
      setValidationErrors([err instanceof Error ? err.message : "Import failed. Payload might be too large."]);
      setStarting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Step 1: Upload Files */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-sm">
            1
          </div>
          <h2 className="text-lg font-bold text-text-primary font-display">
            Upload Catalog Files
          </h2>
        </div>

        {/* Drop zone */}
        <div
          ref={dropZoneRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
            ${isDragging
              ? "border-accent bg-accent/5 scale-[1.01]"
              : "border-border hover:border-accent/50 hover:bg-surface/50"
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />

          <div className="flex flex-col items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                isDragging ? "bg-accent/20" : "bg-surface"
              }`}
            >
              <Upload className={`w-8 h-8 ${isDragging ? "text-accent" : "text-text-muted"}`} />
            </div>
            <div>
              <p className="text-text-primary font-bold text-base">
                {isDragging ? "Drop PDF files here" : "Drag & Drop PDF Catalogs"}
              </p>
              <p className="text-text-muted text-sm mt-1">
                or click to select files
              </p>
              <p className="text-text-muted text-xs mt-2">
                PDF only · Max 200MB per file · Multiple files allowed
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="bg-surface border border-border hover:border-accent text-text-primary hover:text-accent px-6 py-2.5 rounded-full text-sm font-medium transition-colors"
            >
              Select PDF Files
            </button>
          </div>
        </div>

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div className="mt-3 space-y-1">
            {validationErrors.map((err, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-error bg-error/10 border border-error/20 rounded-lg px-4 py-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {err}
              </div>
            ))}
          </div>
        )}

        {/* File list */}
        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-3">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
              Uploaded Files ({uploadedFiles.length})
            </h3>
            {uploadedFiles.map((item) => (
              <div
                key={item.id}
                className="bg-surface-raised border border-border rounded-xl overflow-hidden"
              >
                {/* File header */}
                <div className="flex items-center gap-3 p-4">
                  <div className="w-9 h-9 bg-error/10 border border-error/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-error" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text-primary text-sm truncate">
                      {item.file.name}
                    </div>
                    <div className="text-xs text-text-muted">
                      {formatBytes(item.file.size)} · PDF
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <button
                    onClick={() => removeFile(item.id)}
                    className="p-1.5 text-text-muted hover:text-error transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Per-file assignments */}
                <div className="border-t border-border bg-surface px-4 py-3 flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                    <Tag className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <select
                      value={item.brandId}
                      onChange={(e) => updateFileAssignment(item.id, "brandId", e.target.value)}
                      className="flex-1 border border-border rounded-lg px-3 py-1.5 text-xs focus:border-accent outline-none transition-colors"
                      style={{ backgroundColor: "#0f0f11", color: "#fff", colorScheme: "dark" }}
                    >
                      <option value="">Auto Detect Brand</option>
                      {brands.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                    <Layers className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <select
                      value={item.categoryId}
                      onChange={(e) => updateFileAssignment(item.id, "categoryId", e.target.value)}
                      className="flex-1 border border-border rounded-lg px-3 py-1.5 text-xs focus:border-accent outline-none transition-colors"
                      style={{ backgroundColor: "#0f0f11", color: "#fff", colorScheme: "dark" }}
                    >
                      <option value="">Auto Detect Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Step 2: Import Settings */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-sm">
            2
          </div>
          <h2 className="text-lg font-bold text-text-primary font-display">Import Settings</h2>
        </div>

        <div className="bg-surface-raised border border-border rounded-2xl p-6 space-y-6">
          {/* Default Product Type */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-text-primary">Default Product Type</div>
              <div className="text-xs text-text-muted mt-0.5">Applied to all imported products</div>
            </div>
            <select
              value={settings.defaultProductType}
              onChange={(e) =>
                setSettings({ ...settings, defaultProductType: e.target.value as "cycle" | "accessory" })
              }
              className="border border-border rounded-lg px-4 py-2 text-sm focus:border-accent outline-none transition-colors"
              style={{ backgroundColor: "#0f0f11", color: "#fff", colorScheme: "dark" }}
            >
              <option value="cycle">Cycle</option>
              <option value="accessory">Accessory</option>
            </select>
          </div>

          <div className="border-t border-border" />

          {/* Image Processing */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-text-muted" />
              <span className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Image Processing
              </span>
            </div>
            <div className="space-y-3">
              {[
                {
                  key: "extractImages" as const,
                  label: "Extract Product Images",
                  description: "Attempt to extract bicycle images from each PDF page",
                },
                {
                  key: "attemptBackgroundRemoval" as const,
                  label: "Attempt Background Removal",
                  description:
                    "Apply background removal to isolate the bicycle. Results may need review.",
                },
                {
                  key: "convertToPng" as const,
                  label: "Convert to Transparent PNG",
                  description: "Save the final product image as PNG with transparency",
                },
                {
                  key: "uploadToCloudinary" as const,
                  label: "Upload Processed Image to Cloudinary",
                  description: "Automatically upload approved images to your Cloudinary account",
                },
              ].map(({ key, label, description }) => (
                <label
                  key={key}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={settings[key]}
                      onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        settings[key]
                          ? "bg-accent border-accent"
                          : "bg-bg border-border group-hover:border-accent/50"
                      }`}
                    >
                      {settings[key] && (
                        <svg viewBox="0 0 12 10" className="w-3 h-2 text-bg fill-current">
                          <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2" fill="none" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">{label}</div>
                    <div className="text-xs text-text-muted mt-0.5">{description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <div className="text-xs text-warning/90 space-y-1">
                <p className="font-bold">Important Note on Background Removal</p>
                <p>
                  Automatic background removal is a best-effort process and is not guaranteed to be
                  perfect. All processed images will be flagged for review. Always verify that wheels,
                  handlebars, and all bicycle components are fully intact before approving.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 3: Start Import */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-sm">
            3
          </div>
          <h2 className="text-lg font-bold text-text-primary font-display">Start Import</h2>
        </div>

        {/* Validation errors shown right above the start button */}
        {validationErrors.length > 0 && (
          <div className="mb-4 space-y-1">
            {validationErrors.map((err, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-error bg-error/10 border border-error/20 rounded-lg px-4 py-3"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium">{err}</span>
              </div>
            ))}
          </div>
        )}

        <div className="bg-surface-raised border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-text-primary font-bold">
                {uploadedFiles.length === 0
                  ? "No files selected"
                  : `${uploadedFiles.length} PDF file${uploadedFiles.length > 1 ? "s" : ""} ready`}
              </div>
              <div className="text-xs text-text-muted mt-1">
                Processing will continue in the background even if you navigate away
              </div>
            </div>

            <button
              onClick={handleStartImport}
              disabled={uploadedFiles.length === 0 || starting}
              className="flex items-center gap-3 bg-accent text-bg font-bold px-8 py-4 rounded-full hover:bg-accent-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
            >
              {starting ? (
                <>
                  <div className="w-4 h-4 border-2 border-bg/40 border-t-bg rounded-full animate-spin" />
                  Starting Import...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Import
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
