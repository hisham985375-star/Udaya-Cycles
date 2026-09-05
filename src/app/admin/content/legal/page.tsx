/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from "@/lib/db/mongoose";
import LegalPage from "@/models/LegalPage";
import { LegalCMSClient } from "@/components/admin/LegalCMSClient";

export const dynamic = "force-dynamic";

export default async function AdminLegalCMSPage() {
  await connectDB();
  
  const pages = await LegalPage.find().lean();
  const sanitizedPages = JSON.parse(JSON.stringify(pages));

  return <LegalCMSClient initialPages={sanitizedPages} />;
}
