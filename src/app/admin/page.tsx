/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from "@/lib/db/mongoose";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import ProductVariant from "@/models/ProductVariant";
import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";
import SalesAnalytics, { IDayData, ITopProduct } from "@/components/admin/SalesAnalytics";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await connectDB();

  // 1. Total Revenue (all paid orders)
  const revenueResult = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: null, totalRevenue: { $sum: "$total" } } }
  ]);
  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  // 2. Orders Stats
  const totalOrders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({ status: { $in: ["payment_confirmed", "processing", "payment_pending"] } });

  // 3. Customers Stats
  const totalCustomers = await User.countDocuments();

  // 4. Low Stock Alerts (Stock < 5)
  const lowStockProducts = await Product.countDocuments({ stock: { $lt: 5, $gt: 0 }, hasVariants: false });
  const outOfStockProducts = await Product.countDocuments({ stock: 0, hasVariants: false });
  const lowStockVariants = await ProductVariant.countDocuments({ stock: { $lt: 5, $gt: 0 } });
  const outOfStockVariants = await ProductVariant.countDocuments({ stock: 0 });
  const totalLowStock = lowStockProducts + outOfStockProducts + lowStockVariants + outOfStockVariants;

  // 5. Recent Orders
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "firstName lastName")
    .lean();

  // 6. Detailed Sales Analytics Aggregation
  const allOrdersList = await Order.find()
    .sort({ createdAt: 1 })
    .select("total status paymentStatus items createdAt")
    .lean();

  const dailyMap: Record<string, IDayData> = {};
  const productMap: Record<string, ITopProduct> = {};
  let totalGross = 0;
  let totalPaid = 0;
  let paidOrdersCount = 0;

  // Build the past 7 days timeline so the chart is natural and continuous
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split("T")[0] || "";
    dailyMap[dateKey] = {
      date: dateKey,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fullDate: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
      allRevenue: 0,
      paidRevenue: 0,
      allOrders: 0,
      paidOrders: 0,
    };
  }

  // Populate data from orders
  allOrdersList.forEach((order: any) => {
    const d = new Date(order.createdAt);
    const dateKey = d.toISOString().split("T")[0] || "";
    const totalRupees = (order.total || 0) / 100;
    const isPaid = order.paymentStatus === "paid";

    totalGross += totalRupees;
    if (isPaid) {
      totalPaid += totalRupees;
      paidOrdersCount++;
    }

    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = {
        date: dateKey,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        fullDate: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
        allRevenue: 0,
        paidRevenue: 0,
        allOrders: 0,
        paidOrders: 0,
      };
    }

    const currentDay = dailyMap[dateKey];
    if (currentDay) {
      currentDay.allRevenue += totalRupees;
      currentDay.allOrders += 1;
      if (isPaid) {
        currentDay.paidRevenue += totalRupees;
        currentDay.paidOrders += 1;
      }
    }

    (order.items || []).forEach((it: any) => {
      const name = it.productSnapshot?.name || "Cycle";
      const qty = it.quantity || 1;
      const rev = (it.totalPrice || 0) / 100;
      if (!productMap[name]) productMap[name] = { name, quantity: 0, revenue: 0 };
      productMap[name].quantity += qty;
      productMap[name].revenue += rev;
    });
  });

  const initialDailyData = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
  const topProducts = Object.values(productMap).sort((a, b) => b.quantity - a.quantity).slice(0, 4);

  const kpis = {
    totalGross,
    totalPaid,
    totalOrders,
    paidOrdersCount,
    avgOrderValue: totalOrders > 0 ? totalGross / totalOrders : 0,
  };

  return (
    <div>
      <h1 className="text-3xl font-display font-bold text-text-primary mb-8 uppercase tracking-tight">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-raised p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-text-secondary text-sm font-bold uppercase tracking-wider mb-2">Total Revenue</h3>
          <p className="text-3xl font-mono font-bold text-text-primary">₹{(totalRevenue / 100).toLocaleString('en-IN')}</p>
          <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full mt-3 inline-block font-bold tracking-wide">
            LIFETIME
          </span>
        </div>
        
        <div className="bg-surface-raised p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-text-secondary text-sm font-bold uppercase tracking-wider mb-2">Orders</h3>
          <p className="text-3xl font-mono font-bold text-text-primary">{totalOrders}</p>
          <span className="text-xs text-text-muted mt-3 inline-block font-medium">
            <strong className="text-accent">{pendingOrders}</strong> pending fulfillment
          </span>
        </div>
        
        <div className="bg-surface-raised p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-text-secondary text-sm font-bold uppercase tracking-wider mb-2">Customers</h3>
          <p className="text-3xl font-mono font-bold text-text-primary">{totalCustomers}</p>
          <span className="text-xs text-text-muted mt-3 inline-block font-medium">
            Registered accounts
          </span>
        </div>
        
        <div className="bg-surface-raised p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-text-secondary text-sm font-bold uppercase tracking-wider mb-2">Inventory Alerts</h3>
          <p className={`text-3xl font-mono font-bold ${totalLowStock > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {totalLowStock}
          </p>
          <span className="text-xs text-text-muted mt-3 inline-block font-medium">
            SKUs low or out of stock
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesAnalytics
            initialDailyData={initialDailyData}
            topProducts={topProducts}
            kpis={kpis}
          />
        </div>
        
        <div className="bg-surface-raised rounded-2xl border border-border shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary uppercase tracking-wide">Recent Orders</h3>
            <Link href="/admin/orders" className="text-accent text-sm hover:underline font-medium">View All</Link>
          </div>
          
          {recentOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted pb-12">
              <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">No recent orders</p>
            </div>
          ) : (
            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
              {recentOrders.map((order: any) => (
                <Link key={order._id.toString()} href={`/admin/orders/${order._id}`} className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border hover:border-accent transition-colors group">
                  <div>
                    <div className="text-xs font-mono font-bold text-accent mb-1">{order.orderNumber}</div>
                    <div className="text-sm text-text-primary font-medium">{order.customerDetails?.firstName || 'Guest'}</div>
                    <div className="text-xs text-text-muted">₹{(order.total / 100).toLocaleString('en-IN')}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded bg-bg border border-border">
                      {order.status.replace('_', ' ')}
                    </span>
                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
