import { connectDB } from "@/lib/db/mongoose";
import StoreLocation from "@/models/StoreLocation";
import { StoreLocatorClient } from "@/components/storefront/StoreLocatorClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store Locator | Udaya Cycles",
  description: "Find an official Udaya Cycles retail store near you.",
};

export const dynamic = "force-dynamic";

export default async function StoresPage() {
  await connectDB();
  
  const stores = await StoreLocation.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 }).lean();
  
  // Sanitize for client component
  const sanitizedStores = JSON.parse(JSON.stringify(stores));

  return (
    <main className="bg-bg">
      <div className="bg-surface border-b border-border py-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-display font-black text-text-primary uppercase tracking-tighter mb-4">
          Visit Us In Store
        </h1>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Experience our premium cycles in person. Get expert advice, take a test ride, and find the perfect fit at an official Udaya Cycles retailer.
        </p>
      </div>

      <StoreLocatorClient stores={sanitizedStores} />
    </main>
  );
}
