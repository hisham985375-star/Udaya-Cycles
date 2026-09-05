import { connectDB } from "@/lib/db/mongoose";
import Order from "@/models/Order";
import { notFound } from "next/navigation";
import { AdminOrderDetailClient } from "@/components/admin/AdminOrderDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  await connectDB();
  
  const order = await Order.findById(params.id)
    .populate("user", "firstName lastName email phone")
    .lean();

  if (!order) {
    notFound();
  }

  // Sanitize the object to pass to client component securely
  // converting ObjectIds to strings
  const sanitizedOrder = JSON.parse(JSON.stringify(order));

  return <AdminOrderDetailClient order={sanitizedOrder} />;
}
