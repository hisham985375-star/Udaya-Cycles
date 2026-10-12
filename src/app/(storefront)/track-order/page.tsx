import { Suspense } from "react";
import { Metadata } from "next";
import { TrackOrderClient } from "@/components/storefront/TrackOrderClient";

export const metadata: Metadata = {
  title: "Track Your Order | Udaya Cycles",
  description: "Track your Udaya Cycles order delivery in real time with live route map and milestone updates.",
};

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center bg-[#f8f9fa] dark:bg-[#0e0e0d]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#efff40] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-text-secondary">Loading your order details...</span>
          </div>
        </div>
      }
    >
      <TrackOrderClient />
    </Suspense>
  );
}
