/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from "@/lib/db/mongoose";
import FAQ from "@/models/FAQ";
import { FaqCMSClient } from "@/components/admin/FaqCMSClient";

export const dynamic = "force-dynamic";

export default async function AdminFaqCMSPage() {
  await connectDB();
  
  const faqs = await FAQ.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
  const sanitizedFaqs = JSON.parse(JSON.stringify(faqs));

  return <FaqCMSClient initialFaqs={sanitizedFaqs} />;
}
