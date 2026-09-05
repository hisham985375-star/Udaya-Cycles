"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  RefreshCw,
  StopCircle,
} from "lucide-react";

interface ImportJob {
  _id: string;
  jobNumber: string;
  status: string;
  totalFiles: number;
  processedFiles: number;
  totalProducts: number;
  readyProducts: number;
  needsReviewProducts: number;
  failedProducts: number;
  createdBy?: { username: string };
  createdAt: string;
  completedAt?: string;
}

interface ImportHistoryTableProps {
  jobs: ImportJob[];
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; classes: string }> = {
  QUEUED: { label: "Queued", icon: Clock, classes: "text-text-muted bg-surface-overlay" },
  PROCESSING: {
    label: "Processing",
    icon: RefreshCw,
    classes: "text-[var(--color-info)] bg-[var(--color-info-bg)]",
  },
  COMPLETED: { label: "Completed", icon: CheckCircle2, classes: "text-success bg-success/10" },
  COMPLETED_WITH_ERRORS: {
    label: "With Errors",
    icon: AlertTriangle,
    classes: "text-warning bg-warning/10",
  },
  FAILED: { label: "Failed", icon: XCircle, classes: "text-error bg-error/10" },
  CANCELLED: { label: "Cancelled", icon: StopCircle, classes: "text-text-muted bg-surface-overlay" },
};

const DEFAULT_HISTORY_STATUS = STATUS_CONFIG.QUEUED!;

export function ImportHistoryTable({ jobs }: ImportHistoryTableProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-16 text-text-muted">
        <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No import history yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-text-muted bg-surface border-b border-border">
            <th className="p-4 font-bold">Job ID</th>
            <th className="p-4 font-bold">Date</th>
            <th className="p-4 font-bold">Started By</th>
            <th className="p-4 font-bold">Files</th>
            <th className="p-4 font-bold">Products</th>
            <th className="p-4 font-bold">Ready</th>
            <th className="p-4 font-bold">Errors</th>
            <th className="p-4 font-bold">Status</th>
            <th className="p-4 font-bold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {jobs.map((job) => {
            const config = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.QUEUED!;
            const Icon = config.icon;
            const isActive = ["QUEUED", "PROCESSING"].includes(job.status);

            return (
              <tr
                key={job._id}
                className="hover:bg-surface/50 transition-colors group"
              >
                <td className="p-4">
                  <span className="font-mono font-bold text-accent text-sm">
                    #{job.jobNumber}
                  </span>
                </td>

                <td className="p-4 text-sm text-text-secondary">
                  {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                </td>

                <td className="p-4 text-sm text-text-secondary">
                  {job.createdBy?.username || "—"}
                </td>

                <td className="p-4">
                  <span className="font-mono text-sm text-text-primary">
                    {job.processedFiles} / {job.totalFiles}
                  </span>
                </td>

                <td className="p-4">
                  <span className="font-mono font-bold text-text-primary">
                    {job.totalProducts}
                  </span>
                </td>

                <td className="p-4">
                  <span className="font-mono font-bold text-success">
                    {job.readyProducts}
                  </span>
                </td>

                <td className="p-4">
                  {job.failedProducts > 0 ? (
                    <span className="font-mono font-bold text-error">{job.failedProducts}</span>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </td>

                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full ${config.classes}`}
                  >
                    <Icon
                      className={`w-3 h-3 ${isActive ? "animate-spin" : ""}`}
                    />
                    {config.label}
                  </span>
                </td>

                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/admin/products/bulk-import/${job._id}`}
                      className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-accent border border-border hover:border-accent px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Review
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
