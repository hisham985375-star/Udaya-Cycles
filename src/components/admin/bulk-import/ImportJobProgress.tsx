"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Clock, RefreshCw, StopCircle } from "lucide-react";
import Link from "next/link";

interface JobStatus {
  _id: string;
  jobNumber: string;
  status: string;
  totalFiles: number;
  processedFiles: number;
  totalProducts: number;
  readyProducts: number;
  needsReviewProducts: number;
  failedProducts: number;
  approvedProducts: number;
  startedAt?: string;
  completedAt?: string;
}

interface ImportJobProgressProps {
  jobId: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
  QUEUED: { label: "Queued", icon: Clock, color: "text-text-muted", bgColor: "bg-surface-overlay" },
  PROCESSING: {
    label: "Processing",
    icon: RefreshCw,
    color: "text-[var(--color-info)]",
    bgColor: "bg-[var(--color-info-bg)]",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  COMPLETED_WITH_ERRORS: {
    label: "Completed with Errors",
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  FAILED: { label: "Failed", icon: XCircle, color: "text-error", bgColor: "bg-error/10" },
  CANCELLED: {
    label: "Cancelled",
    icon: StopCircle,
    color: "text-text-muted",
    bgColor: "bg-surface-overlay",
  },
};

const DEFAULT_STATUS = STATUS_CONFIG.QUEUED!;

export function ImportJobProgress({ jobId }: ImportJobProgressProps) {
  const [job, setJob] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/bulk-import/${jobId}`);
      if (!res.ok) throw new Error("Failed to fetch job status");
      const data = await res.json();
      setJob(data.job);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchStatus();

    // Poll every 3 seconds while processing
    const interval = setInterval(() => {
      if (job && ["QUEUED", "PROCESSING"].includes(job.status)) {
        fetchStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchStatus, job]);

  // Re-poll when status changes to active
  useEffect(() => {
    if (!job) return;
    if (!["QUEUED", "PROCESSING"].includes(job.status)) return;

    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [job?.status, fetchStatus]);

  const handleCancel = async () => {
    if (!confirm("Cancel this import job?")) return;
    setCancelLoading(true);
    try {
      await fetch(`/api/admin/bulk-import/${jobId}/cancel`, { method: "POST" });
      fetchStatus();
    } catch {
      //
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface-raised border border-border rounded-2xl p-8 flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="bg-surface-raised border border-border rounded-2xl p-8 text-center text-error">
        {error || "Job not found"}
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.QUEUED!;
  const StatusIcon = statusConfig.icon;

  const filesProgress =
    job.totalFiles > 0 ? (job.processedFiles / job.totalFiles) * 100 : 0;
  const isActive = ["QUEUED", "PROCESSING"].includes(job.status);

  // Stats
  const stats = [
    {
      label: "Total Files",
      value: `${job.processedFiles} / ${job.totalFiles}`,
      color: "text-text-primary",
    },
    { label: "Products Detected", value: job.totalProducts, color: "text-text-primary" },
    { label: "Ready", value: job.readyProducts, color: "text-success" },
    { label: "Needs Review", value: job.needsReviewProducts, color: "text-warning" },
    { label: "Failed", value: job.failedProducts, color: "text-error" },
  ];

  return (
    <div className="bg-surface-raised border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-text-primary font-display tracking-tight">
              IMPORT JOB #{job.jobNumber}
            </h2>
            <span
              className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${statusConfig.color} ${statusConfig.bgColor}`}
            >
              <StatusIcon
                className={`w-3.5 h-3.5 ${job.status === "PROCESSING" ? "animate-spin" : ""}`}
              />
              {statusConfig.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isActive && (
            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="text-sm text-error border border-error/30 hover:bg-error/10 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <StopCircle className="w-4 h-4" />
              {cancelLoading ? "Cancelling..." : "Cancel"}
            </button>
          )}
          <button
            onClick={fetchStatus}
            className="p-2 text-text-muted hover:text-text-primary transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-5 divide-x divide-border border-b border-border">
        {stats.map((stat) => (
          <div key={stat.label} className="p-5 text-center">
            <div className={`text-3xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-text-muted font-medium mt-1 uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-secondary">
            {isActive ? "Processing files..." : "Processing complete"}
          </span>
          <span className="text-sm font-mono font-bold text-accent">
            {Math.round(filesProgress)}%
          </span>
        </div>
        <div className="h-3 bg-bg rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${filesProgress}%` }}
          />
        </div>

        {/* Action buttons when done */}
        {!isActive && job.status !== "CANCELLED" && (
          <div className="mt-6 flex items-center gap-4">
            <Link
              href={`/admin/products/bulk-import/${jobId}`}
              className="bg-accent text-bg font-bold px-6 py-3 rounded-full hover:bg-accent-dim transition-colors flex items-center gap-2 text-sm uppercase tracking-wide"
            >
              <CheckCircle2 className="w-4 h-4" />
              Review {job.totalProducts} Products
            </Link>
            {job.failedProducts > 0 && (
              <button
                onClick={async () => {
                  await fetch(`/api/admin/bulk-import/${jobId}/retry`, { method: "POST" });
                  fetchStatus();
                }}
                className="text-sm text-error border border-error/30 hover:bg-error/10 px-4 py-2.5 rounded-full transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry {job.failedProducts} Failed
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
