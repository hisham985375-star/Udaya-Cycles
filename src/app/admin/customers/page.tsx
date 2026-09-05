/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";
import Order from "@/models/Order";
import Link from "next/link";
import { Search, Mail, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  searchParams
}: {
  searchParams: { q?: string; page?: string }
}) {
  await connectDB();
  
  const query = searchParams.q || "";
  const page = parseInt(searchParams.page || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  // Build filter query
  const filter: any = {};
  if (query) {
    filter.$or = [
      { firstName: { $regex: query, $options: "i" } },
      { lastName: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } }
    ];
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalPages = Math.ceil(total / limit);

  // Fetch aggregate order stats for these users in one query
  const userIds = users.map((u: any) => u._id);
  const orderStats = await Order.aggregate([
    { $match: { user: { $in: userIds }, paymentStatus: "paid" } },
    { $group: { 
        _id: "$user", 
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: "$total" }
      }
    }
  ]);

  const statsMap = orderStats.reduce((acc: any, curr: any) => {
    acc[curr._id.toString()] = curr;
    return acc;
  }, {});

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary uppercase tracking-tight">Customers</h1>
          <p className="text-text-secondary mt-1">Manage registered accounts and customer history</p>
        </div>
      </div>

      <div className="bg-surface-raised rounded-2xl border border-border overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface">
          <form className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input 
              type="text" 
              name="q"
              defaultValue={query}
              placeholder="Search customers..."
              className="w-full bg-bg border border-border rounded-lg py-2 pl-10 pr-4 text-sm text-text-primary focus:border-accent outline-none"
            />
            <noscript><button type="submit">Filter</button></noscript>
          </form>
          
          <div className="text-sm font-medium text-text-secondary shrink-0">
            Showing {users.length} of {total} customers
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface text-text-secondary text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-border">Customer</th>
                <th className="p-4 font-bold border-b border-border">Registered On</th>
                <th className="p-4 font-bold border-b border-border text-center">Total Orders</th>
                <th className="p-4 font-bold border-b border-border text-right">Lifetime Value</th>
                <th className="p-4 font-bold border-b border-border text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-text-muted">
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                users.map((user: any) => {
                  const stats = statsMap[user._id.toString()] || { totalOrders: 0, totalSpent: 0 };
                  return (
                    <tr key={user._id.toString()} className="hover:bg-surface/50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold uppercase shrink-0">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-text-primary text-sm">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                              <Mail className="w-3 h-3" /> {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-text-secondary font-medium">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-bold text-text-primary">{stats.totalOrders}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono font-bold text-accent">
                          ₹{(stats.totalSpent / 100).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link 
                          href={`/admin/customers/${user._id}`}
                          className="inline-flex p-2 text-text-secondary hover:text-accent bg-bg rounded-md border border-transparent hover:border-border transition-colors opacity-0 group-hover:opacity-100"
                          title="View Profile"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
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
                href={`/admin/customers?page=${i + 1}${query ? `&q=${query}` : ''}`}
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
