import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const metadata = {
  title: "Checkout | Udaya Cycles",
  description: "Secure checkout for Udaya Cycles",
};

export default function CheckoutPage() {
  return (
    <div className="section-padding bg-bg min-h-screen">
      <div className="container-udaya">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary uppercase tracking-tight mb-12">
          Secure <span className="text-text-muted">Checkout</span>
        </h1>
        <CheckoutClient />
      </div>
    </div>
  );
}
