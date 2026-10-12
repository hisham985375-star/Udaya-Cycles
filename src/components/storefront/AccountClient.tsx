"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import {
  Package,
  Truck,
  ArrowRight,
  LogOut,
  User as UserIcon,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  MapPin,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface OrderItem {
  _id?: string;
  product?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productSnapshot?: {
    name: string;
    sku: string;
    image: string;
    attributes?: Record<string, string>;
  };
}

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  items: OrderItem[];
  shippingAddress?: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    city: string;
    state: string;
    pinCode: string;
    phone: string;
  };
  trackingNumber?: string;
}

interface AccountClientProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AccountClient({ user }: AccountClientProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      try {
        const res = await fetch("/api/account/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        } else {
          console.error("Failed to load customer orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const handleSignOut = async () => {
    toast.success("Signing out...");
    await signOut({ callbackUrl: "/" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return {
          label: "Delivered",
          className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          icon: CheckCircle2,
        };
      case "in_transit":
        return {
          label: "In Transit",
          className: "bg-[#efff40]/15 text-[#efff40] border-[#efff40]/40",
          icon: Truck,
        };
      case "shipped":
        return {
          label: "Shipped",
          className: "bg-blue-500/10 text-blue-400 border-blue-500/30",
          icon: Package,
        };
      case "packed":
      case "processing":
        return {
          label: "Processing",
          className: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          icon: Clock,
        };
      case "order_confirmed":
        return {
          label: "Confirmed",
          className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          icon: CheckCircle2,
        };
      case "cancelled":
        return {
          label: "Cancelled",
          className: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          icon: AlertCircle,
        };
      default:
        return {
          label: status.replace("_", " "),
          className: "bg-surface-raised text-text-secondary border-border",
          icon: Package,
        };
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "in_transit") return order.status === "in_transit" || order.status === "shipped";
    if (statusFilter === "delivered") return order.status === "delivered";
    if (statusFilter === "confirmed") return order.status === "order_confirmed" || order.status === "processing";
    return true;
  });

  return (
    <div className="min-h-screen bg-bg text-text-primary pb-24 section-padding">
      <div className="container-udaya max-w-6xl mx-auto">
        {/* ── Customer Account Header Banner ─────────────────────────── */}
        <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-surface-raised border border-border flex items-center justify-center font-bold text-2xl md:text-3xl text-accent shadow-inner">
              {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary">
                  {user.name || "Customer Account"}
                </h1>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-accent/15 text-accent px-2.5 py-0.5 rounded-full border border-accent/30">
                  Member
                </span>
              </div>
              <p className="text-sm text-text-secondary mt-1">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/track-order?orderId=UC125480"
              className="px-4 py-2.5 rounded-xl bg-surface-raised border border-border hover:border-accent text-xs font-semibold text-text-primary flex items-center gap-2 transition-colors"
            >
              <Truck className="w-4 h-4 text-accent" /> Track Any Order
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* ── Account Tabs ──────────────────────────────────────────── */}
        <div className="flex items-center gap-4 border-b border-border mb-8">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 pb-3 px-1 text-sm md:text-base font-bold transition-all relative ${
              activeTab === "orders"
                ? "text-accent"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders</span>
            {orders.length > 0 && (
              <span className="text-xs bg-surface-raised px-2 py-0.5 rounded-full border border-border font-mono">
                {orders.length}
              </span>
            )}
            {activeTab === "orders" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 pb-3 px-1 text-sm md:text-base font-bold transition-all relative ${
              activeTab === "profile"
                ? "text-accent"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile & Addresses</span>
            {activeTab === "profile" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        </div>

        {/* ── MY ORDERS SECTION ───────────────────────────────────────── */}
        {activeTab === "orders" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold font-display text-text-primary">
                  Order History
                </h2>
                <p className="text-xs md:text-sm text-text-secondary">
                  Review all complete orders placed with your account and track deliveries in real time.
                </p>
              </div>

              {/* Status Filters */}
              {orders.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {[
                    { id: "all", label: "All" },
                    { id: "in_transit", label: "In Transit" },
                    { id: "confirmed", label: "Confirmed" },
                    { id: "delivered", label: "Delivered" },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setStatusFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        statusFilter === filter.id
                          ? "bg-accent text-bg"
                          : "bg-surface border border-border text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loading ? (
              <div className="p-12 bg-surface rounded-2xl border border-border flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-text-muted">Loading your orders...</span>
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="space-y-6">
                {filteredOrders.map((order) => {
                  const badge = getStatusBadge(order.status);
                  const BadgeIcon = badge.icon;
                  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={order._id}
                      className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-[#333330] transition-all shadow-sm"
                    >
                      {/* Order Card Header */}
                      <div className="p-5 md:px-6 bg-surface-raised/40 border-b border-border flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm">
                          <div>
                            <span className="text-text-muted block text-[11px]">Order Number</span>
                            <span className="font-mono font-bold text-accent">{order.orderNumber}</span>
                          </div>
                          <div className="h-6 w-px bg-border hidden sm:block" />
                          <div>
                            <span className="text-text-muted block text-[11px]">Placed On</span>
                            <span className="font-medium text-text-primary flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-text-muted" />
                              {orderDate}
                            </span>
                          </div>
                          <div className="h-6 w-px bg-border hidden sm:block" />
                          <div>
                            <span className="text-text-muted block text-[11px]">Payment</span>
                            <span className="font-semibold text-text-secondary capitalize">
                              {order.paymentMethod === "razorpay" ? "Online (Razorpay)" : "Cash on Delivery"}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge + Track Button */}
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${badge.className}`}
                          >
                            <BadgeIcon className="w-3.5 h-3.5" />
                            {badge.label}
                          </span>

                          <Link
                            href={`/track-order?orderId=${encodeURIComponent(order.orderNumber)}`}
                            className="bg-accent hover:bg-accent-dim text-bg font-bold px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm hover:scale-[1.02]"
                          >
                            <Truck className="w-3.5 h-3.5" /> Track Order
                          </Link>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="p-5 md:p-6 divide-y divide-border/60">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-xl bg-surface-raised border border-border p-1.5 flex items-center justify-center shrink-0 overflow-hidden relative">
                                <Image
                                  src={item.productSnapshot?.image || "/pictures/mtb category img.png"}
                                  alt={item.productSnapshot?.name || "Bicycle"}
                                  width={60}
                                  height={60}
                                  className="object-contain w-full h-full"
                                />
                              </div>
                              <div>
                                <h3 className="font-bold text-sm md:text-base text-text-primary leading-snug">
                                  {item.productSnapshot?.name || "High-Performance Bicycle"}
                                </h3>
                                <div className="text-xs text-text-muted mt-0.5 space-y-0.5">
                                  {item.productSnapshot?.sku && (
                                    <span>SKU: {item.productSnapshot.sku} </span>
                                  )}
                                  <p>Quantity: {item.quantity}</p>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="font-bold text-sm md:text-base text-text-primary">
                                ₹{(item.unitPrice * item.quantity).toLocaleString("en-IN")}
                              </span>
                              <span className="block text-xs text-text-muted">
                                ₹{item.unitPrice.toLocaleString("en-IN")} each
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer: Delivery Info & Total */}
                      <div className="px-5 md:px-6 py-4 bg-surface-raised/20 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs md:text-sm">
                        <div className="flex items-center gap-2 text-text-muted">
                          <MapPin className="w-4 h-4 text-accent shrink-0" />
                          <span>
                            Delivery to:{" "}
                            <strong className="text-text-secondary font-medium">
                              {order.shippingAddress?.city || "Destination"},{" "}
                              {order.shippingAddress?.state || "India"} -{" "}
                              {order.shippingAddress?.pinCode || ""}
                            </strong>
                          </span>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <span className="text-text-muted">Total Paid:</span>
                          <span className="text-lg font-mono font-bold text-accent">
                            ₹{order.total.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty state with sample preview option */
              <div className="bg-surface rounded-2xl border border-border p-10 md:p-14 text-center">
                <div className="w-16 h-16 rounded-full bg-surface-raised border border-border flex items-center justify-center mx-auto mb-4 text-accent">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-display text-text-primary mb-2">
                  No orders placed yet
                </h3>
                <p className="text-sm text-text-secondary max-w-md mx-auto mb-8">
                  Once you order your dream cycle, you can view your complete order history, milestones, and live delivery updates here.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/cycles/category/all"
                    className="h-12 px-6 rounded-full bg-accent text-bg font-bold text-sm flex items-center justify-center gap-2 hover:bg-accent-dim transition-all shadow-md"
                  >
                    Explore Cycles <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/track-order?orderId=UC125480"
                    className="h-12 px-6 rounded-full bg-surface-raised border border-border hover:border-accent text-text-primary font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Truck className="w-4 h-4 text-accent" /> View Sample Tracking
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE & ADDRESSES TAB ─────────────────────────────────── */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Details Card */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <h3 className="text-lg font-bold font-display text-text-primary mb-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-accent" /> Personal Information
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-xs text-text-muted block">Full Name</span>
                  <span className="font-semibold text-text-primary">{user.name || "N/A"}</span>
                </div>
                <div>
                  <span className="text-xs text-text-muted block">Email Address</span>
                  <span className="font-mono text-text-primary">{user.email || "N/A"}</span>
                </div>
                <div>
                  <span className="text-xs text-text-muted block">Account Status</span>
                  <span className="inline-block mt-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    Active & Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Support */}
            <div className="bg-surface rounded-2xl border border-border p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold font-display text-text-primary mb-3">
                  Need Help With Your Account?
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-6">
                  For support with previous orders, returns, warranty claims, or doorstep cycle service, our customer care team is available 7 days a week.
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href="https://wa.me/919539752725"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-[#25D366]/30"
                >
                  Contact Support on WhatsApp
                </a>
                <Link
                  href="/store-locator"
                  className="w-full py-3 px-4 rounded-xl bg-surface-raised hover:bg-surface-overlay text-text-primary text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-border"
                >
                  Find Nearest Service Store
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
