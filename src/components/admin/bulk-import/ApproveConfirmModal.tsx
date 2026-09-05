"use client";

import { AlertTriangle, CheckCircle2, X } from "lucide-react";

interface ApproveConfirmModalProps {
  count: number;
  jobId: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  confirming: boolean;
  result?: {
    created: number;
    duplicates: number;
    skipped: number;
    errors: string[];
  } | null;
}

export function ApproveConfirmModal({
  count,
  onConfirm,
  onClose,
  confirming,
  result,
}: ApproveConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm" onClick={!confirming ? onClose : undefined} />

      <div className="relative bg-surface-raised border border-border rounded-2xl shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary font-display">
            {result ? "Approval Complete" : "Confirm Approval"}
          </h2>
          {!confirming && (
            <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text-primary transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Result state */}
          {result ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-success">
                <CheckCircle2 className="w-8 h-8 shrink-0" />
                <div>
                  <div className="font-bold text-lg">{result.created} Products Created</div>
                  <div className="text-sm text-text-secondary">as Draft products</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-success/10 border border-success/20 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-success">{result.created}</div>
                  <div className="text-xs text-text-muted">Created</div>
                </div>
                <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-warning">{result.duplicates}</div>
                  <div className="text-xs text-text-muted">Duplicates</div>
                </div>
                <div className="bg-error/10 border border-error/20 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-error">{result.skipped}</div>
                  <div className="text-xs text-text-muted">Skipped</div>
                </div>
              </div>

              {result.duplicates > 0 && (
                <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-warning text-sm font-bold mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    {result.duplicates} Duplicate Detected
                  </div>
                  <p className="text-xs text-text-secondary">
                    Duplicate products were flagged as &ldquo;Needs Review&rdquo; and were not created automatically.
                    Review them individually to decide whether to update existing products.
                  </p>
                </div>
              )}

              <div className="bg-surface rounded-xl p-4 border border-border">
                <p className="text-sm text-text-secondary">
                  ✅ All created products are set to <span className="font-bold text-text-primary">DRAFT</span> status.
                  They will <strong>not</strong> appear on the customer storefront until you publish them manually.
                </p>
              </div>

              {result.errors.length > 0 && (
                <div className="max-h-32 overflow-y-auto bg-error/5 border border-error/20 rounded-lg p-3">
                  <p className="text-xs font-bold text-error mb-2">Errors ({result.errors.length}):</p>
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-error/80">{err}</p>
                  ))}
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full bg-accent text-bg font-bold py-3 rounded-full hover:bg-accent-dim transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            /* Confirm state */
            <div className="space-y-5">
              <div className="text-center">
                <div className="text-5xl font-bold text-accent mb-2">{count}</div>
                <div className="text-text-primary font-bold text-lg">Products Ready to Approve</div>
              </div>

              <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
                <p className="text-sm text-text-secondary flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  Products will be added to the Product database
                </p>
                <p className="text-sm text-text-secondary flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  All products will be created as <strong className="text-text-primary">DRAFT</strong>
                </p>
                <p className="text-sm text-text-secondary flex items-start gap-2">
                  <span className="text-error mt-0.5">✗</span>
                  Products will <strong className="text-text-primary">NOT</strong> be published to the storefront
                </p>
                <p className="text-sm text-text-secondary flex items-start gap-2">
                  <span className="text-warning mt-0.5">⚠</span>
                  Possible duplicates will be flagged and skipped
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={confirming}
                  className="flex-1 py-3 rounded-full border border-border text-text-secondary hover:text-text-primary transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={confirming}
                  className="flex-1 py-3 rounded-full bg-accent text-bg font-bold hover:bg-accent-dim transition-colors disabled:opacity-60"
                >
                  {confirming ? "Creating products..." : `Approve ${count} Products`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
