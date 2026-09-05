/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { CreditCard, Truck, ShieldCheck } from "lucide-react";
import Image from "next/image";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function CheckoutClient() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pinCode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="section-padding text-center">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <button onClick={() => router.push("/")} className="text-accent hover:underline">
          Go back to shopping
        </button>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const shippingFee = subtotal > 5000000 ? 0 : 50000;
  const total = subtotal + shippingFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create order on our backend
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            sku: item.sku,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            attributes: item.attributes
          })),
          shippingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            addressLine1: formData.addressLine1,
            addressLine2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            pinCode: formData.pinCode,
          },
          customerDetails: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          },
          subtotal,
          shippingFee,
          discount: 0,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create order");

      if (paymentMethod === "cod") {
        clearCart();
        router.push(`/checkout/success?orderNumber=${data.orderNumber}`);
      } else {
        // Razorpay flow
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use public key here
          amount: data.amount,
          currency: "INR",
          name: "Udaya Cycles",
          description: "Premium Bicycles & Accessories",
          order_id: data.razorpayOrderId,
          handler: async function (response: any) {
            // Verify payment
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              clearCart();
              router.push(`/checkout/success?orderNumber=${verifyData.orderNumber}`);
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: "#efff40", // Udaya accent color
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          alert(`Payment Failed: ${response.error.description}`);
          setLoading(false);
        });
        rzp.open();
      }
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      {/* Checkout Form */}
      <div className="lg:w-2/3">
        <form onSubmit={handleCheckout} className="space-y-10">
          
          {/* Customer Info */}
          <section>
            <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="firstName" placeholder="First Name" required value={formData.firstName} onChange={handleInputChange} className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary focus:border-accent outline-none" />
              <input type="text" name="lastName" placeholder="Last Name" required value={formData.lastName} onChange={handleInputChange} className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary focus:border-accent outline-none" />
              <input type="email" name="email" placeholder="Email Address" required value={formData.email} onChange={handleInputChange} className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary focus:border-accent outline-none md:col-span-2" />
              <input type="tel" name="phone" placeholder="Phone Number" required value={formData.phone} onChange={handleInputChange} className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary focus:border-accent outline-none md:col-span-2" />
            </div>
          </section>

          {/* Shipping Info */}
          <section>
            <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="addressLine1" placeholder="Address Line 1" required value={formData.addressLine1} onChange={handleInputChange} className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary focus:border-accent outline-none md:col-span-2" />
              <input type="text" name="addressLine2" placeholder="Address Line 2 (Optional)" value={formData.addressLine2} onChange={handleInputChange} className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary focus:border-accent outline-none md:col-span-2" />
              <input type="text" name="city" placeholder="City" required value={formData.city} onChange={handleInputChange} className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary focus:border-accent outline-none" />
              <input type="text" name="state" placeholder="State" required value={formData.state} onChange={handleInputChange} className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary focus:border-accent outline-none" />
              <input type="text" name="pinCode" placeholder="PIN Code" required value={formData.pinCode} onChange={handleInputChange} className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary focus:border-accent outline-none md:col-span-2" />
            </div>
          </section>

          {/* Payment Method */}
          <section>
            <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Payment Method</h2>
            <div className="space-y-4">
              <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'razorpay' ? 'border-accent bg-accent/5' : 'border-border bg-surface'}`}>
                <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="w-5 h-5 accent-accent" />
                <div className="flex-1">
                  <div className="font-bold text-text-primary">Razorpay (Credit/Debit/UPI)</div>
                  <div className="text-sm text-text-secondary">Pay securely with Razorpay</div>
                </div>
                <CreditCard className="w-6 h-6 text-text-muted" />
              </label>

              <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-accent bg-accent/5' : 'border-border bg-surface'}`}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 accent-accent" />
                <div className="flex-1">
                  <div className="font-bold text-text-primary">Cash on Delivery</div>
                  <div className="text-sm text-text-secondary">Pay when you receive the order</div>
                </div>
                <Truck className="w-6 h-6 text-text-muted" />
              </label>
            </div>
          </section>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-accent text-bg font-bold uppercase tracking-wide rounded-full hover:bg-accent-dim transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? "Processing..." : `Pay ₹${(total / 100).toLocaleString('en-IN')}`}
          </button>
        </form>
      </div>

      {/* Order Summary */}
      <div className="lg:w-1/3">
        <div className="bg-surface-raised border border-border rounded-2xl p-6 sticky top-28">
          <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Order Summary</h2>
          
          <div className="space-y-4 mb-6 border-b border-border pb-6 max-h-60 overflow-y-auto custom-scrollbar">
            {items.map(item => (
              <div key={item.id} className="flex gap-4">
                <div className="w-16 h-16 bg-surface rounded-lg relative overflow-hidden flex-shrink-0 border border-border">
                  {item.image !== 'placeholder' && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                </div>
                <div className="flex-1 text-sm">
                  <h3 className="font-bold text-text-primary line-clamp-1">{item.name}</h3>
                  <div className="text-text-muted text-xs mb-1">Qty: {item.quantity}</div>
                  <div className="font-mono font-medium">₹{((item.price * item.quantity) / 100).toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 mb-6 border-b border-border pb-6 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal</span>
              <span className="font-mono font-medium text-text-primary">₹{(subtotal / 100).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Shipping</span>
              <span className="font-mono font-medium text-text-primary">₹{(shippingFee / 100).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex justify-between items-end mb-6">
            <span className="text-lg font-bold text-text-primary">Total</span>
            <span className="text-2xl font-mono font-bold text-text-primary">
              ₹{(total / 100).toLocaleString('en-IN')}
            </span>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-text-muted text-xs uppercase tracking-wider font-bold">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            Secure SSL Checkout
          </div>
        </div>
      </div>
    </div>
  );
}
