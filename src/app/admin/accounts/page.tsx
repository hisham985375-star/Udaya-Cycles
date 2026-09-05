import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import Admin from "@/models/Admin";
import { getAdminSession } from "@/lib/auth/admin-auth";
import { AccountsClient } from "@/components/admin/AccountsClient";

export const dynamic = "force-dynamic";

export default async function AdminAccountsPage() {
  const session = await getAdminSession();
  
  if (!session || session.role !== "superadmin") {
    redirect("/admin"); // Only superadmins can view this page
  }

  await connectDB();
  const admins = await Admin.find().select("-passwordHash").sort({ createdAt: -1 }).lean();

  const sanitizedAdmins = JSON.parse(JSON.stringify(admins));

  return <AccountsClient initialAdmins={sanitizedAdmins} currentAdminId={session.id as string} />;
}
