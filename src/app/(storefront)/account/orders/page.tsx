import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { AccountClient } from "@/components/storefront/AccountClient";

export const metadata: Metadata = {
  title: "My Orders | Udaya Cycles",
  description: "View and track all completed orders placed on Udaya Cycles.",
};

export default async function AccountOrdersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/account/orders");
  }

  return <AccountClient user={session.user} />;
}
