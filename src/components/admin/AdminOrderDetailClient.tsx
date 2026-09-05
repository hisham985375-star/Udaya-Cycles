/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  CreditCard, 
  Package, 
  Clock, 
  CheckCircle2,
  Truck,
  AlertTriangle,
  XCircle,
  ExternalLink
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AdminOrderDetailClient({ order }: { order: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl || "");
  const [courierPartner, setCourierPartner] = useState(order.courierPartner || "");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order._id,
          status,
          paymentStatus,
          trackingNumber,
          trackingUrl,
          courierPartner
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update order");
      }

      alert("Order updated successfully!");
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/orders"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface border border-border hover:border-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary uppercase tracking-tight flex items-center gap-4">
            Order {order.orderNumber}
            <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${statusColors[order.status] || "bg-surface text-text-secondary border-border"}`}>
              {order.status.replace('_', ' ')}
            </span>
          </h1>
          <p className="text-text-secondary mt-1 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" /> Placed on {new Date(order.createdAt).toLocaleString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Items & Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Order Items */}
          <div className="bg-surface-raised rounded-2xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-bold text-text-primary uppercase tracking-wide flex items-center gap-2">
                <Package className="w-5 h-5 text-accent" /> Order Items
              </h2>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="p-6 flex gap-6">
                  <div className="w-20 h-20 bg-surface rounded-lg border border-border relative overflow-hidden flex-shrink-0">
                    {item.productSnapshot?.image ? (
                      <Image src={item.productSnapshot.image} alt={item.productSnapshot.name} fill className="object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] text-text-muted uppercase tracking-widest">Image</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-text-primary line-clamp-1">{item.productSnapshot?.name || "Unknown Product"}</h3>
                    <div className="text-sm font-mono text-text-muted mb-2">SKU: {item.productSnapshot?.sku || item.sku}</div>
                    
                    {item.productSnapshot?.attributes && (
                      <div className="flex gap-4 mb-2">
                        {Object.entries(item.productSnapshot.attributes).map(([key, value]) => (
                          <span key={key} className="text-xs uppercase tracking-wider text-text-secondary bg-surface px-2 py-1 rounded">
                            {key}: <span className="font-bold">{value as React.ReactNode}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex flex-col justify-between">
                    <div className="font-mono font-bold text-text-primary">
                      ₹{((item.totalPrice || item.price * item.quantity) / 100).toLocaleString('en-IN')}
                    </div>
                    <div className="text-sm text-text-secondary">
                      Qty: <span className="font-bold text-text-primary">{item.quantity}</span> x ₹{((item.unitPrice || item.price) / 100).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 bg-surface border-t border-border">
              <div className="flex justify-end w-full">
                <div className="w-full sm:w-1/2 space-y-3">
                  <div className="flex justify-between text-sm text-text-secondary">
                    <span>Subtotal</span>
                    <span className="font-mono text-text-primary font-medium">₹{(order.subtotal / 100).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-text-secondary">
                    <span>Shipping Fee</span>
                    <span className="font-mono text-text-primary font-medium">₹{(order.shippingFee / 100).toLocaleString('en-IN')}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-500">
                      <span>Discount</span>
                      <span className="font-mono font-medium">- ₹{(order.discount / 100).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-text-primary pt-3 border-t border-border">
                    <span>Total</span>
                    <span className="font-mono text-accent">₹{(order.total / 100).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Timeline / History */}
          <div className="bg-surface-raised rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold text-text-primary uppercase tracking-wide mb-6">Status History</h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {order.statusHistory?.map((hist: any, i: number) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-surface shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                    {hist.status === 'delivered' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : 
                     hist.status === 'cancelled' ? <XCircle className="w-4 h-4 text-red-500" /> :
                     hist.status === 'shipped' ? <Truck className="w-4 h-4 text-accent" /> :
                     <div className="w-2 h-2 rounded-full bg-text-muted"></div>}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-surface shadow">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-text-primary text-sm uppercase">{hist.status.replace('_', ' ')}</div>
                      <time className="font-mono text-xs text-text-muted">{new Date(hist.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</time>
                    </div>
                    {hist.note && <div className="text-sm text-text-secondary">{hist.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Status Update & Info */}
        <div className="space-y-8">
          
          {/* Admin Actions */}
          <form onSubmit={handleUpdate} className="bg-surface-raised rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold text-text-primary uppercase tracking-wide mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-accent" /> Manage Order
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Order Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none appearance-none"
                >
                  <option value="payment_pending">Payment Pending</option>
                  <option value="payment_confirmed">Payment Confirmed</option>
                  <option value="order_confirmed">Order Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="in_transit">In Transit</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed_delivery">Failed Delivery</option>
                  <option value="returned">Returned</option>
                  <option value="refunded">Refunded</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Payment Status</label>
                <select 
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none appearance-none"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-border space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Courier Partner</label>
                  <input 
                    type="text" 
                    value={courierPartner}
                    onChange={(e) => setCourierPartner(e.target.value)}
                    placeholder="e.g. BlueDart"
                    className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Tracking Number</label>
                  <input 
                    type="text" 
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="AWB Number"
                    className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Tracking URL</label>
                  <input 
                    type="url" 
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-accent text-bg font-bold h-12 rounded-lg uppercase tracking-wide hover:bg-accent-dim transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>

          {/* Customer & Shipping */}
          <div className="bg-surface-raised rounded-2xl border border-border p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary mb-4 flex items-center gap-2">
                <User className="w-4 h-4" /> Customer Info
              </h3>
              <div className="text-sm">
                <div className="font-bold text-text-primary">{order.customerDetails?.firstName} {order.customerDetails?.lastName}</div>
                <div className="text-text-secondary mt-1"><a href={`mailto:${order.customerDetails?.email}`} className="hover:text-accent">{order.customerDetails?.email}</a></div>
                <div className="text-text-secondary mt-1">{order.customerDetails?.phone}</div>
                
                {order.user && (
                  <Link href={`/admin/customers/${order.user}`} className="mt-3 inline-flex items-center gap-1 text-xs text-accent hover:underline uppercase font-bold tracking-wider">
                    View Profile <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Shipping Address
              </h3>
              <div className="text-sm text-text-secondary leading-relaxed">
                <div className="font-bold text-text-primary mb-1">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</div>
                {order.shippingAddress?.addressLine1}<br />
                {order.shippingAddress?.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
                {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                PIN: {order.shippingAddress?.pinCode}<br />
                Phone: {order.shippingAddress?.phone}
              </div>
            </div>
            
            <div className="pt-6 border-t border-border">
              <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Payment Details
              </h3>
              <div className="text-sm text-text-secondary space-y-2">
                <div className="flex justify-between">
                  <span>Method</span>
                  <span className="font-bold text-text-primary uppercase">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className={`font-bold uppercase ${order.paymentStatus === 'paid' ? 'text-green-500' : order.paymentStatus === 'failed' ? 'text-red-500' : 'text-yellow-500'}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                {order.razorpayPaymentId && (
                  <div className="flex justify-between mt-2 pt-2 border-t border-border/50">
                    <span>Txn ID</span>
                    <span className="font-mono text-xs">{order.razorpayPaymentId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
