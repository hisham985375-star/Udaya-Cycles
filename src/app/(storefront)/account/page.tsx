import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { AccountClient } from "@/components/storefront/AccountClient";

export const metadata: Metadata = {
  title: "My Account & Orders | Udaya Cycles",
  description: "View your order history, delivery status, and profile on Udaya Cycles.",
};

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  return <AccountClient user={session.user} />;
}
