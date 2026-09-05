/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";
import Order from "@/models/Order";
import Review from "@/models/Review";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  ShoppingCart,
  Star
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  await connectDB();
  
  const user = await User.findById(params.id).lean();
  if (!user) notFound();

  // Fetch orders
  const orders = await Order.find({ user: params.id })
    .sort({ createdAt: -1 })
    .lean();
    
  // Fetch reviews
  const reviews = await Review.find({ user: params.id })
    .populate("product", "name slug")
    .sort({ createdAt: -1 })
    .lean();

  const totalSpent = orders.filter((o: any) => o.paymentStatus === 'paid').reduce((sum: number, o: any) => sum + o.total, 0);

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/customers"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface border border-border hover:border-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-text-primary uppercase tracking-tight">
            Customer Profile
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            Overview of customer activity and details
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col - Info */}
        <div className="space-y-8">
          <div className="bg-surface-raised rounded-2xl border border-border p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-accent/10 border-2 border-accent/20 mx-auto flex items-center justify-center text-accent text-3xl font-bold uppercase mb-4 shadow-[0_0_20px_rgba(239,255,64,0.1)]">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-1">{user.firstName} {user.lastName}</h2>
            <div className="text-text-secondary text-sm mb-6">Registered {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</div>
            
            <div className="flex flex-col gap-3 text-left">
              <div className="flex items-center gap-3 text-sm text-text-secondary bg-surface p-3 rounded-xl border border-border">
                <Mail className="w-4 h-4 text-text-muted" />
                <a href={`mailto:${user.email}`} className="hover:text-accent truncate">{user.email}</a>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3 text-sm text-text-secondary bg-surface p-3 rounded-xl border border-border">
                  <Phone className="w-4 h-4 text-text-muted" />
                  <a href={`tel:${user.phone}`} className="hover:text-accent">{user.phone}</a>
                </div>
              )}
            </div>
          </div>

          {/* KPI Cards for Customer */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-raised rounded-xl border border-border p-4 text-center shadow">
              <div className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Total Orders</div>
              <div className="text-2xl font-mono font-bold text-text-primary">{orders.length}</div>
            </div>
            <div className="bg-surface-raised rounded-xl border border-border p-4 text-center shadow">
              <div className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">LTV</div>
              <div className="text-xl font-mono font-bold text-accent">₹{(totalSpent / 100).toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-surface-raised rounded-xl border border-border p-4 text-center shadow col-span-2">
              <div className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Reviews Written</div>
              <div className="text-2xl font-mono font-bold text-text-primary">{reviews.length}</div>
            </div>
          </div>
        </div>

        {/* Right Col - Activity */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-surface-raised rounded-2xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-bold text-text-primary uppercase tracking-wide flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-accent" /> Order History
              </h2>
            </div>
            <div className="divide-y divide-border max-h-96 overflow-y-auto custom-scrollbar">
              {orders.length === 0 ? (
                <div className="p-8 text-center text-text-muted">No orders found.</div>
              ) : (
                orders.map((order: any) => (
                  <Link key={order._id.toString()} href={`/admin/orders/${order._id}`} className="block p-4 bg-surface hover:bg-surface-raised transition-colors group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-mono font-bold text-text-primary group-hover:text-accent transition-colors">{order.orderNumber}</div>
                      <div className="text-xs text-text-muted">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-text-secondary">{order.items?.length || 0} items</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs uppercase tracking-widest font-bold px-2 py-1 rounded bg-bg border border-border">
                          {order.status.replace('_', ' ')}
                        </span>
                        <span className="font-mono font-bold text-text-primary">₹{(order.total / 100).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="bg-surface-raised rounded-2xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-bold text-text-primary uppercase tracking-wide flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" /> Product Reviews
              </h2>
            </div>
            <div className="divide-y divide-border max-h-96 overflow-y-auto custom-scrollbar">
              {reviews.length === 0 ? (
                <div className="p-8 text-center text-text-muted">No reviews written yet.</div>
              ) : (
                reviews.map((review: any) => (
                  <div key={review._id.toString()} className="p-4 bg-surface">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Link href={`/products/${review.product?.slug}`} className="font-bold text-text-primary hover:text-accent text-sm">
                          {review.product?.name || "Unknown Product"}
                        </Link>
                        <div className="flex items-center mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-accent text-accent' : 'text-border'}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-text-muted">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-sm text-text-primary mt-2">{review.title}</h4>
                    <p className="text-sm text-text-secondary mt-1">{review.comment}</p>
                    <div className="mt-2 text-xs">
                      <span className={`px-2 py-1 rounded uppercase tracking-wider font-bold ${review.isApproved ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {review.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
