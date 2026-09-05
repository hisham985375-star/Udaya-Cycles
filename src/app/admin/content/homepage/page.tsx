/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from "@/lib/db/mongoose";
import HomepageSettings from "@/models/HomepageSettings";
import { HomepageCMSClient } from "@/components/admin/HomepageCMSClient";

export const dynamic = "force-dynamic";

export default async function AdminHomepageCMSPage() {
  await connectDB();
  
  let settings = await HomepageSettings.findOne().lean();

  if (!settings) {
    const newSettings = await HomepageSettings.create({});
    settings = newSettings.toObject() as any;
  }

  // Sanitize for client component
  const sanitizedSettings = JSON.parse(JSON.stringify(settings));

  return <HomepageCMSClient initialData={sanitizedSettings} />;
}
