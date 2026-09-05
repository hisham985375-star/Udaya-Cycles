"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { Minus, Plus, Trash2, ArrowRight, ShieldCheck, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="section-padding bg-bg min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-surface border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const estimatedShipping = subtotal > 5000000 ? 0 : 50000; // Rs 50,000 threshold, Rs 500 shipping (in paise)
  const total = subtotal + estimatedShipping;

  if (items.length === 0) {
    return (
      <div className="section-padding bg-bg min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center text-text-muted mb-6 border border-border">
          <ShoppingBag className="w-10 h-10 opacity-50" />
        </div>
        <h1 className="text-3xl font-display font-bold text-text-primary uppercase tracking-tight mb-4">Your Cart is Empty</h1>
        <p className="text-text-secondary mb-8 max-w-md">
          Looks like you haven&apos;t added anything to your cart yet. Explore our high-performance cycles and gear.
        </p>
        <Link 
          href="/cycles/category/all"
          className="bg-accent text-bg font-bold px-8 py-4 rounded-full hover:bg-accent-dim hover-scale transition-all tracking-wide uppercase text-sm"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="section-padding bg-bg min-h-screen">
      <div className="container-udaya">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary uppercase tracking-tight mb-12">
          Your <span className="text-text-muted">Cart</span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="lg:w-2/3 space-y-6">
            <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-bold uppercase tracking-widest text-text-muted border-b border-border pb-4">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-6 border-b border-border group">
                
                {/* Product Info */}
                <div className="col-span-1 md:col-span-6 flex gap-6">
                  <div className="w-28 h-28 bg-surface rounded-xl relative overflow-hidden flex-shrink-0 border border-border flex items-center justify-center text-xs text-text-muted uppercase tracking-widest text-center">
                     {item.image !== 'placeholder' ? (
                       <Image src={item.image} alt={item.name} fill className="object-cover" />
                     ) : 'Image'}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-bold text-text-primary text-lg mb-2 group-hover:text-accent transition-colors">
                      {item.name}
                    </h3>
                    {(item.attributes?.color || item.attributes?.size) && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.attributes.color && (
                          <span className="text-xs bg-surface-raised px-2 py-1 rounded text-text-secondary border border-border">
                            {item.attributes.color}
                          </span>
                        )}
                        {item.attributes.size && (
                          <span className="text-xs bg-surface-raised px-2 py-1 rounded text-text-secondary border border-border">
                            {item.attributes.size}
                          </span>
                        )}
                      </div>
                    )}
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-text-muted hover:text-red-500 transition-colors text-sm flex items-center gap-1 w-fit"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
                
                {/* Quantity */}
                <div className="col-span-1 md:col-span-3 flex justify-start md:justify-center">
                  <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden h-10">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-10 h-full flex items-center justify-center text-text-primary hover:text-accent hover:bg-bg transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center text-sm font-mono font-bold text-text-primary bg-bg py-2">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-10 h-full flex items-center justify-center text-text-primary hover:text-accent hover:bg-bg transition-colors disabled:opacity-50 disabled:hover:text-text-primary disabled:hover:bg-transparent"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-1 md:col-span-3 flex justify-start md:justify-end">
                  <p className="font-mono font-bold text-text-primary text-xl">
                    ₹{((item.price * item.quantity) / 100).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-surface-raised border border-border rounded-2xl p-8 sticky top-28">
              <h2 className="text-xl font-display font-bold text-text-primary uppercase tracking-wide mb-6">
                Order Summary
              </h2>
              
              <div className="space-y-4 mb-6 border-b border-border pb-6">
                <div className="flex justify-between items-center text-text-secondary">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium text-text-primary">₹{(subtotal / 100).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-text-secondary">
                  <span>Estimated Shipping</span>
                  {estimatedShipping === 0 ? (
                    <span className="font-bold text-accent uppercase tracking-wider text-xs">Free</span>
                  ) : (
                    <span className="font-mono font-medium text-text-primary">₹{(estimatedShipping / 100).toLocaleString('en-IN')}</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-text-secondary">
                  <span>Taxes</span>
                  <span className="text-xs uppercase tracking-wider text-text-muted">Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-lg font-bold text-text-primary">Total</span>
                <span className="text-3xl font-mono font-bold text-text-primary">
                  ₹{(total / 100).toLocaleString('en-IN')}
                </span>
              </div>

              <Link
                href="/checkout"
                className="w-full h-14 flex items-center justify-center gap-2 bg-accent text-bg font-bold uppercase tracking-wide text-sm rounded-full hover:bg-accent-dim hover-scale transition-all shadow-[0_0_20px_rgba(239,255,64,0.3)] hover:shadow-[0_0_30px_rgba(239,255,64,0.5)] mb-4"
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </Link>
              
              <div className="flex items-center justify-center gap-2 text-text-muted text-xs uppercase tracking-wider font-bold">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                Secure Encrypted Checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
