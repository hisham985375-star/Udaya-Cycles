import { StoreLocatorClient } from "@/components/storefront/StoreLocatorClient";

export const metadata = {
  title: "Store Locator | Udaya Cycles",
  description: "Find a Udaya Cycles store near you.",
};

export default function StoreLocatorPage() {
  return (
    <div className="section-padding bg-bg min-h-screen">
      <div className="container-udaya">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary uppercase tracking-tight mb-8">
          Store <span className="text-accent">Locator</span>
        </h1>
        <StoreLocatorClient />
      </div>
    </div>
  );
}
