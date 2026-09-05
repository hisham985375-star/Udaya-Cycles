import { connectDB } from "@/lib/db/mongoose";
import HomepageSettings from "@/models/HomepageSettings";
import { ContactClient } from "@/components/storefront/ContactClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Udaya Cycles",
  description: "Get in touch with Udaya Cycles. We are here to help you with your cycling needs.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  await connectDB();
  const settings = await HomepageSettings.findOne().lean();
  
  const contactInfo = settings?.contact ? JSON.parse(JSON.stringify(settings.contact)) : {};

  return (
    <main className="bg-bg">
      <div className="bg-surface border-b border-border py-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-display font-black text-text-primary uppercase tracking-tighter mb-4">
          Contact Support
        </h1>
        <p className="text-text-secondary max-w-2xl mx-auto">
          We're here to help. Reach out to us for any questions regarding our cycles, your order, or general inquiries.
        </p>
      </div>

      <ContactClient contactInfo={contactInfo} />
    </main>
  );
}
