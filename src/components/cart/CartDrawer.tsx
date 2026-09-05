"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function CartDrawer() {
  const { items, isOpen, toggleCart, updateQuantity, removeItem, getSubtotal } = useCartStore();
  
  // Hydration mismatch fix for Zustand persist
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => toggleCart(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-surface-raised border-l border-border z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-bg/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-display font-bold text-text-primary uppercase tracking-wide">
              Your Cart
            </h2>
          </div>
          <button 
            onClick={() => toggleCart(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface hover:bg-bg hover:text-accent border border-border transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center text-text-muted mb-4 border border-border">
                <ShoppingBag className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-text-secondary font-medium">Your cart is currently empty.</p>
              <button 
                onClick={() => toggleCart(false)}
                className="mt-4 text-accent font-bold uppercase tracking-wider text-sm hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-bg border border-border group">
                {/* Product Image */}
                <div className="w-24 h-24 bg-surface rounded-lg relative overflow-hidden flex-shrink-0 border border-border flex items-center justify-center text-xs text-text-muted uppercase tracking-widest text-center p-2">
                   {item.image !== 'placeholder' ? (
                     <Image src={item.image} alt={item.name} fill className="object-cover" />
                   ) : 'Image'}
                </div>
                
                {/* Product Details */}
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-text-primary line-clamp-2 text-sm leading-tight">
                        {item.name}
                      </h3>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-text-muted hover:text-red-500 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Attributes (Color, Size) */}
                    {(item.attributes?.color || item.attributes?.size) && (
                      <div className="flex flex-wrap gap-2 mt-2">
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
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-text-primary hover:text-accent hover:bg-bg transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-mono font-bold text-text-primary bg-bg py-1">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-8 h-8 flex items-center justify-center text-text-primary hover:text-accent hover:bg-bg transition-colors disabled:opacity-50 disabled:hover:text-text-primary disabled:hover:bg-transparent"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    {/* Price */}
                    <p className="font-mono font-bold text-text-primary">
                      ₹{((item.price * item.quantity) / 100).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-border bg-bg">
            <div className="flex justify-between items-center mb-6">
              <span className="text-text-secondary uppercase tracking-widest text-sm font-medium">Subtotal</span>
              <span className="text-xl font-mono font-bold text-text-primary">
                ₹{(getSubtotal() / 100).toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-xs text-text-muted mb-6 text-center">
              Taxes and shipping calculated at checkout
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/cart"
                onClick={() => toggleCart(false)}
                className="w-full py-4 text-center border-2 border-text-primary text-text-primary font-bold uppercase tracking-wide text-sm rounded-full hover:bg-text-primary hover:text-bg transition-colors"
              >
                View Full Cart
              </Link>
              <Link
                href="/checkout"
                onClick={() => toggleCart(false)}
                className="w-full py-4 text-center bg-accent text-bg font-bold uppercase tracking-wide text-sm rounded-full hover:bg-accent-dim hover-scale transition-all shadow-[0_0_20px_rgba(239,255,64,0.3)] hover:shadow-[0_0_30px_rgba(239,255,64,0.5)]"
              >
                Secure Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
