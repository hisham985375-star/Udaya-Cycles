/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from "@/lib/db/mongoose";
import HomepageSettings from "@/models/HomepageSettings";
import { SettingsClient } from "@/components/admin/SettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await connectDB();
  
  let settings = await HomepageSettings.findOne().lean();

  if (!settings) {
    const newSettings = await HomepageSettings.create({});
    settings = newSettings.toObject() as any;
  }

  // Sanitize for client component
  const sanitizedSettings = JSON.parse(JSON.stringify(settings));

  return <SettingsClient initialData={sanitizedSettings} />;
}
