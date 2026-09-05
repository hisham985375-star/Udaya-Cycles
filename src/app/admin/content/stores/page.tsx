/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from "@/lib/db/mongoose";
import StoreLocation from "@/models/StoreLocation";
import { StoreCMSClient } from "@/components/admin/StoreCMSClient";

export const dynamic = "force-dynamic";

export default async function AdminStoresCMSPage() {
  await connectDB();
  
  const stores = await StoreLocation.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
  const sanitizedStores = JSON.parse(JSON.stringify(stores));

  return <StoreCMSClient initialStores={sanitizedStores} />;
}
