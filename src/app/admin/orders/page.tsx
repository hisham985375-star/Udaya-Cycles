/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from "@/lib/db/mongoose";
import Order from "@/models/Order";
import Link from "next/link";
import { Search, Eye, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}) {
  await connectDB();
  const sp = await searchParams;
  const query = sp.q || "";
  const statusFilter = sp.status || "";
  const page = parseInt(sp.page || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  // Build filter query
  const filter: any = {};
  if (query) {
    filter.$or = [
      { orderNumber: { $regex: query, $options: "i" } },
      { "customerDetails.email": { $regex: query, $options: "i" } },
      { "customerDetails.firstName": { $regex: query, $options: "i" } },
      { "customerDetails.lastName": { $regex: query, $options: "i" } }
    ];
  }
  if (statusFilter) {
    filter.status = statusFilter;
  }

  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate("user", "firstName lastName email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalPages = Math.ceil(total / limit);

  const statusColors: Record<string, string> = {
    payment_pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    payment_confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    order_confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    processing: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    shipped: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    delivered: "bg-green-500/10 text-green-500 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary uppercase tracking-tight">Orders</h1>
          <p className="text-text-secondary mt-1">Manage customer orders and fulfillment</p>
        </div>
      </div>

      <div className="bg-surface-raised rounded-2xl border border-border overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface">
          <form className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input 
                type="text" 
                name="q"
                defaultValue={query}
                placeholder="Search orders..."
                className="w-full bg-bg border border-border rounded-lg py-2 pl-10 pr-4 text-sm text-text-primary focus:border-accent outline-none"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <select 
                name="status"
                defaultValue={statusFilter}
                className="w-full sm:w-48 bg-bg border border-border rounded-lg py-2 pl-10 pr-8 text-sm text-text-primary focus:border-accent outline-none appearance-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="payment_pending">Payment Pending</option>
                <option value="order_confirmed">Order Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <noscript><button type="submit">Filter</button></noscript>
          </form>
          
          <div className="text-sm font-medium text-text-secondary shrink-0">
            Showing {orders.length} of {total} orders
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface text-text-secondary text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-border">Order ID / Date</th>
                <th className="p-4 font-bold border-b border-border">Customer</th>
                <th className="p-4 font-bold border-b border-border">Items</th>
                <th className="p-4 font-bold border-b border-border">Total</th>
                <th className="p-4 font-bold border-b border-border">Status</th>
                <th className="p-4 font-bold border-b border-border text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-text-muted">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order._id.toString()} className="hover:bg-surface/50 transition-colors group">
                    <td className="p-4">
                      <div className="font-mono font-bold text-accent mb-1">{order.orderNumber}</div>
                      <div className="text-xs text-text-muted">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-text-primary text-sm">
                        {order.customerDetails?.firstName} {order.customerDetails?.lastName}
                      </div>
                      <div className="text-xs text-text-secondary">{order.customerDetails?.email}</div>
                    </td>
                    <td className="p-4 text-sm text-text-secondary font-medium">
                      {order.items.length} item{order.items.length !== 1 && 's'}
                    </td>
                    <td className="p-4">
                      <div className="font-mono font-bold text-text-primary">
                        ₹{(order.total / 100).toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-text-muted uppercase mt-1">{order.paymentMethod}</div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${statusColors[order.status] || "bg-surface text-text-secondary border-border"}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/admin/orders/${order._id}`}
                        className="inline-flex p-2 text-text-secondary hover:text-accent bg-bg rounded-md border border-transparent hover:border-border transition-colors opacity-0 group-hover:opacity-100"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border bg-surface flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Link
                key={i}
                href={`/admin/orders?page=${i + 1}${query ? `&q=${query}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
                className={`w-10 h-10 flex items-center justify-center rounded-lg border font-mono font-bold transition-colors ${
                  page === i + 1 
                    ? "bg-accent text-bg border-accent" 
                    : "bg-bg text-text-secondary border-border hover:border-accent hover:text-accent"
                }`}
              >
                {i + 1}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
