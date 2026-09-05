"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  return (
    <div className="section-padding bg-bg min-h-[80vh] flex items-center justify-center">
      <div className="container-udaya max-w-2xl text-center">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping"></div>
            <div className="relative w-24 h-24 bg-surface rounded-full flex items-center justify-center border-2 border-accent text-accent">
              <CheckCircle2 className="w-12 h-12" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary uppercase tracking-tight mb-4">
          Order Confirmed
        </h1>
        
        <p className="text-lg text-text-secondary mb-8">
          Thank you for choosing Udaya Cycles. Your high-performance gear is being prepared for dispatch.
        </p>

        {orderNumber && (
          <div className="bg-surface border border-border rounded-2xl p-6 mb-10 inline-flex flex-col items-center justify-center min-w-[300px]">
            <span className="text-text-muted text-xs uppercase tracking-widest font-bold mb-2">Order Number</span>
            <span className="font-mono text-2xl font-bold text-accent">{orderNumber}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/account/orders"
            className="h-14 px-8 flex items-center justify-center gap-2 bg-surface-raised border-2 border-border text-text-primary font-bold uppercase tracking-wide rounded-full hover:border-text-primary transition-colors"
          >
            <Package className="w-5 h-5" /> Track Order
          </Link>
          <Link
            href="/cycles/category/all"
            className="h-14 px-8 flex items-center justify-center gap-2 bg-accent text-bg font-bold uppercase tracking-wide rounded-full hover:bg-accent-dim hover-scale transition-all shadow-[0_0_20px_rgba(239,255,64,0.3)] hover:shadow-[0_0_30px_rgba(239,255,64,0.5)]"
          >
            Continue Shopping <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
