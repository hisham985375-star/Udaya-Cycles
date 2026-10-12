"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Package,
  Truck,
  ArrowRight,
  ArrowLeft,
  Printer,
  MessageCircle,
  Copy,
  Check,
  MapPin,
  Headphones,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-hot-toast";

// Dynamically load Leaflet tracking map with SSR disabled to prevent window crash
const TrackingMap = dynamic(() => import("./TrackingMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] rounded-2xl bg-[#f0f3f6] dark:bg-[#1a1a18] animate-pulse flex items-center justify-center border border-border">
      <span className="text-text-muted text-sm font-medium">Loading map route...</span>
    </div>
  ),
});

interface TrackOrderClientProps {
  initialOrderId?: string;
}

export function TrackOrderClient({ initialOrderId }: TrackOrderClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdParam = searchParams?.get("orderId") || searchParams?.get("id") || initialOrderId || "";
  const awbParam = searchParams?.get("awb") || "";

  const [activeTab, setActiveTab] = useState<"orderId" | "awb">(awbParam ? "awb" : "orderId");
  const [searchInput, setSearchInput] = useState(orderIdParam || awbParam || "");
  const [copiedAwb, setCopiedAwb] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);

  const fetchTracking = async (queryValue: string, queryType: "orderId" | "awb") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/track-order?query=${encodeURIComponent(queryValue)}&type=${queryType}`);
      const data = await res.json();
      if (data.tracking) {
        setTrackingData(data.tracking);
      }
    } catch (err) {
      console.error("Failed to load tracking data", err);
      toast.error("Could not load tracking information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = orderIdParam || awbParam || "UC125480";
    const t = awbParam ? "awb" : "orderId";
    setSearchInput(q);
    setActiveTab(t);
    fetchTracking(q, t);
  }, [orderIdParam, awbParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      toast.error("Please enter an Order ID or AWB number");
      return;
    }
    fetchTracking(searchInput.trim(), activeTab);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAwb(true);
    toast.success("AWB Tracking ID copied to clipboard!");
    setTimeout(() => setCopiedAwb(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const data = trackingData;

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0e0e0d] text-[#111827] dark:text-[#f3f4f6] pb-24 transition-colors">
      {/* ── Breadcrumb Bar ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#141412] border-b border-[#e5e7eb] dark:border-[#222220] py-3.5">
        <div className="container-udaya max-w-6xl mx-auto flex items-center gap-2 text-xs text-[#6b7280] dark:text-[#9ca3af]">
          <Link href="/" className="hover:text-accent font-medium transition-colors">
            Home
          </Link>
          <span>&rsaquo;</span>
          <span className="text-[#111827] dark:text-white font-semibold">Track Order</span>
        </div>
      </div>

      <div className="container-udaya max-w-6xl mx-auto pt-6 md:pt-8 px-4 sm:px-6">
        {/* ── Page Header Banner matching reference ──────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#111827] dark:text-white tracking-tight mb-2">
              Track Your Order
            </h1>
            <p className="text-sm md:text-base text-[#4b5563] dark:text-[#9ca3af]">
              Enter your order details to get real-time updates on your cycle delivery.
            </p>
          </div>

          {/* Slogan & Rider graphic */}
          <div className="hidden lg:flex items-center gap-4 bg-gradient-to-r from-transparent via-[#efff40]/10 to-[#efff40]/20 dark:via-[#efff40]/5 dark:to-[#efff40]/10 px-5 py-2.5 rounded-2xl border border-[#efff40]/30">
            <div className="text-right">
              <span className="block font-serif italic text-base font-bold text-[#111827] dark:text-[#efff40]">
                Your Cycle Is On The Way
              </span>
              <span className="block text-xs font-black tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
                Let&apos;s Go !
              </span>
            </div>
            <div className="w-12 h-12 relative flex items-center justify-center bg-white dark:bg-[#222220] rounded-full shadow-sm text-accent">
              <Truck className="w-6 h-6 text-[#111827] dark:text-[#efff40]" />
            </div>
          </div>
        </div>

        {/* ── Tracking Search & Tabs Box ────────────────────────────── */}
        <div className="bg-white dark:bg-[#161614] rounded-2xl p-5 md:p-6 shadow-sm border border-[#e5e7eb] dark:border-[#2a2a28] mb-8">
          {/* Tab Switcher */}
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => {
                setActiveTab("orderId");
                if (searchInput === "138904567823") setSearchInput("UC125480");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                activeTab === "orderId"
                  ? "bg-[#efff40] text-black shadow-sm font-bold"
                  : "bg-[#f3f4f6] dark:bg-[#222220] text-[#6b7280] dark:text-[#9ca3af] hover:bg-[#e5e7eb] dark:hover:bg-[#2a2a28]"
              }`}
            >
              <Package className="w-4 h-4" /> Order ID
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("awb");
                if (searchInput === "UC125480") setSearchInput("138904567823");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                activeTab === "awb"
                  ? "bg-[#efff40] text-black shadow-sm font-bold"
                  : "bg-[#f3f4f6] dark:bg-[#222220] text-[#6b7280] dark:text-[#9ca3af] hover:bg-[#e5e7eb] dark:hover:bg-[#2a2a28]"
              }`}
            >
              <Truck className="w-4 h-4" /> AWB / Tracking ID
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={
                  activeTab === "orderId"
                    ? "Enter your order ID (e.g. UC125480)"
                    : "Enter your AWB tracking number (e.g. 138904567823)"
                }
                className="w-full bg-[#fcfcfc] dark:bg-[#1f1f1d] border border-[#d1d5db] dark:border-[#333330] rounded-xl px-4 py-3.5 text-sm md:text-base text-[#111827] dark:text-white placeholder-[#9ca3af] focus:outline-none focus:border-[#efff40] focus:ring-2 focus:ring-[#efff40]/20 transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#efff40] hover:bg-[#e2f520] active:scale-[0.98] text-black font-bold px-7 py-3.5 rounded-xl text-sm md:text-base flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <span>Searching...</span>
              ) : (
                <>
                  Track Order <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mt-3">
            You can find your Order ID in the order confirmation email or SMS.
          </p>
        </div>

        {/* ── Main Order Overview Card ──────────────────────────────── */}
        {data && (
          <div className="bg-white dark:bg-[#161614] rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#2a2a28] overflow-hidden mb-8">
            {/* Action Bar Header */}
            <div className="px-5 py-4 border-b border-[#f3f4f6] dark:border-[#222220] flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
              <Link
                href="/account"
                className="flex items-center gap-1.5 font-semibold text-[#374151] dark:text-[#d1d5db] hover:text-accent transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Orders
              </Link>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e7eb] dark:border-[#2a2a28] hover:bg-[#f3f4f6] dark:hover:bg-[#222220] text-[#4b5563] dark:text-[#9ca3af] transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <a
                  href={`https://wa.me/919539752725?text=${encodeURIComponent(
                    `Hi Udaya Cycles, I want an update on my order ${data.orderNumber} (AWB: ${data.awbNumber})`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#25D366]/10 text-[#15803d] dark:text-[#4ade80] hover:bg-[#25D366]/20 font-medium transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" /> Get updates on WhatsApp
                </a>
              </div>
            </div>

            {/* Product Summary & Status Banner */}
            <div className="p-5 md:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Product Info */}
              <div className="flex items-center gap-5 md:gap-6">
                <div className="w-24 h-24 md:w-32 md:h-28 rounded-2xl bg-[#f8f9fa] dark:bg-[#222220] border border-[#e5e7eb] dark:border-[#2a2a28] flex items-center justify-center p-2 shrink-0 overflow-hidden relative">
                  <Image
                    src={data.product.image || "/pictures/mtb category img.png"}
                    alt={data.product.name}
                    width={140}
                    height={120}
                    className="object-contain w-full h-full hover:scale-105 transition-transform"
                  />
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-bold text-[#111827] dark:text-white leading-tight mb-1">
                    {data.product.name}
                  </h2>
                  <div className="text-xs text-[#6b7280] dark:text-[#9ca3af] space-y-0.5">
                    <p>SKU: {data.product.sku}</p>
                    <p>
                      Size: {data.product.size} <span className="mx-1">|</span> Color: {data.product.color}
                    </p>
                  </div>
                  <p className="text-base md:text-lg font-bold text-[#111827] dark:text-white mt-2">
                    ₹{Number(data.product.price).toLocaleString("en-IN")} &times; {data.product.quantity}
                  </p>
                </div>
              </div>

              {/* Status Box matching reference */}
              <div className="w-full lg:w-auto min-w-[280px] bg-[#ecfdf5] dark:bg-[#14281e] border border-[#a7f3d0] dark:border-[#1d4e38] rounded-2xl p-4 md:p-5 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#10b981] text-white flex items-center justify-center shadow-md shrink-0">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold tracking-wider uppercase text-[#047857] dark:text-[#6ee7b7]">
                    CURRENT STATUS
                  </span>
                  <span className="block text-lg font-black text-[#065f46] dark:text-white leading-snug">
                    {data.currentStatus}
                  </span>
                  <span className="block text-xs text-[#047857] dark:text-[#a7f3d0] font-medium">
                    {data.statusNote}
                  </span>
                </div>
              </div>
            </div>

            {/* Metadata 5-Column Grid matching reference */}
            <div className="px-5 md:px-8 py-5 bg-[#fafafa] dark:bg-[#1c1c1a] border-y border-[#f0f0f0] dark:border-[#222220] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 text-xs md:text-sm">
              <div>
                <span className="block text-[#6b7280] dark:text-[#9ca3af] mb-1 font-medium">Order ID</span>
                <span className="font-bold font-mono text-[#111827] dark:text-white">{data.orderNumber}</span>
              </div>

              <div>
                <span className="block text-[#6b7280] dark:text-[#9ca3af] mb-1 font-medium">AWB / Tracking ID</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold font-mono text-[#111827] dark:text-white">{data.awbNumber}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(data.awbNumber)}
                    className="p-1 hover:text-accent transition-colors"
                    title="Copy AWB number"
                  >
                    {copiedAwb ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#9ca3af] hover:text-[#111827] dark:hover:text-white" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <span className="block text-[#6b7280] dark:text-[#9ca3af] mb-1 font-medium">Courier Partner</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#111827] dark:text-white">{data.courierPartner}</span>
                  <span className="text-[10px] font-black uppercase bg-[#111827] text-white px-2 py-0.5 rounded tracking-wider">
                    DELHIVERY
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-[#6b7280] dark:text-[#9ca3af] mb-1 font-medium">Order Date</span>
                <span className="font-semibold text-[#111827] dark:text-white">{data.orderDate}</span>
              </div>

              <div>
                <span className="block text-[#6b7280] dark:text-[#9ca3af] mb-1 font-medium">Estimated Delivery</span>
                <div className="flex items-center gap-1.5 font-bold text-[#111827] dark:text-[#efff40]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{data.estimatedDelivery}</span>
                </div>
              </div>
            </div>

            {/* Stepper Timeline Bar matching reference image */}
            <div className="p-6 md:p-10">
              <div className="relative">
                {/* Connecting horizontal line */}
                <div className="hidden sm:block absolute top-4 left-6 right-6 h-1 bg-[#e5e7eb] dark:bg-[#2a2a28] -z-0">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-700"
                    style={{ width: "60%" }}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-6 sm:gap-2 relative z-10">
                  {data.stepper.map((step: any, idx: number) => {
                    const isCompleted = step.status === "completed";
                    const isCurrent = step.status === "current";

                    return (
                      <div key={idx} className="flex flex-col items-center text-center">
                        {/* Milestone Circle */}
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mb-3 transition-all ${
                            isCompleted
                              ? "bg-emerald-500 text-white shadow-sm ring-4 ring-emerald-500/20"
                              : isCurrent
                              ? "bg-[#10b981] text-white ring-4 ring-emerald-500/30 animate-pulse shadow-lg scale-110"
                              : "bg-[#f3f4f6] dark:bg-[#222220] border-2 border-[#d1d5db] dark:border-[#444] text-[#9ca3af]"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                          ) : isCurrent ? (
                            <Truck className="w-5 h-5 stroke-[2.5]" />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#d1d5db] dark:bg-[#555]" />
                          )}
                        </div>

                        {/* Title */}
                        <span
                          className={`text-xs md:text-sm font-bold mb-1 ${
                            isCurrent
                              ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                              : isCompleted
                              ? "text-[#111827] dark:text-white"
                              : "text-[#9ca3af]"
                          }`}
                        >
                          {step.label}
                        </span>

                        {/* Sub date */}
                        <span className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] leading-tight">
                          {step.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 2-Column Section: Shipment History + Live Tracking ────── */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            {/* Left: Shipment History (6 cols) */}
            <div className="lg:col-span-6 bg-white dark:bg-[#161614] rounded-2xl p-6 md:p-7 shadow-sm border border-[#e5e7eb] dark:border-[#2a2a28]">
              <h3 className="text-lg font-bold text-[#111827] dark:text-white mb-6">
                Shipment History
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-3 before:w-0.5 before:bg-[#e5e7eb] dark:before:bg-[#2a2a28]">
                {data.shipmentHistory.map((item: any, idx: number) => {
                  return (
                    <div key={idx} className="relative group">
                      {/* Timeline dot */}
                      <div
                        className={`absolute -left-[19px] top-1.5 w-3 h-3 rounded-full border-2 transition-all ${
                          item.isActive
                            ? "bg-emerald-500 border-white ring-4 ring-emerald-500/20"
                            : "bg-emerald-400 border-white"
                        }`}
                      />

                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-1">
                        <span className="text-xs font-semibold text-[#6b7280] dark:text-[#9ca3af]">
                          {item.timestamp}
                        </span>
                      </div>

                      <div className="text-sm font-bold text-[#111827] dark:text-white leading-snug">
                        {item.status}
                      </div>

                      <p className="text-xs text-[#4b5563] dark:text-[#9ca3af] mt-0.5">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-1 text-[11px] text-[#6b7280] dark:text-[#9ca3af] mt-1">
                        <MapPin className="w-3 h-3 text-[#9ca3af]" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Live Tracking (6 cols) */}
            <div className="lg:col-span-6 bg-white dark:bg-[#161614] rounded-2xl p-6 md:p-7 shadow-sm border border-[#e5e7eb] dark:border-[#2a2a28] flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#111827] dark:text-white mb-4">
                  Live Tracking
                </h3>
                <TrackingMap
                  currentHub={data.liveLocation?.currentHub || "Kochi Hub"}
                  status={data.currentStatus || "In Transit"}
                  timestamp="27 Sep, 06:20 PM"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Bottom Cards: Delivery Address + Need Help? ───────────── */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Delivery Address Card */}
            <div className="md:col-span-6 bg-white dark:bg-[#161614] rounded-2xl p-6 shadow-sm border border-[#e5e7eb] dark:border-[#2a2a28] flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#f3f4f6] dark:bg-[#222220] flex items-center justify-center shrink-0 text-[#111827] dark:text-white">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111827] dark:text-white mb-2">
                    Delivery Address
                  </h4>
                  <div className="text-xs text-[#4b5563] dark:text-[#9ca3af] space-y-0.5 leading-relaxed">
                    <p className="font-semibold text-[#111827] dark:text-white">
                      {data.deliveryAddress?.fullName}
                    </p>
                    <p>{data.deliveryAddress?.addressLine1}</p>
                    <p>
                      {data.deliveryAddress?.city} - {data.deliveryAddress?.postalCode}
                    </p>
                    <p>{data.deliveryAddress?.state}</p>
                    <p className="font-mono mt-1 text-[#111827] dark:text-white">
                      {data.deliveryAddress?.phone}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toast("Address cannot be modified while shipment is In Transit")}
                className="px-3 py-1 rounded-md bg-[#f3f4f6] dark:bg-[#222220] hover:bg-[#e5e7eb] dark:hover:bg-[#2a2a28] text-xs font-semibold text-[#4b5563] dark:text-[#9ca3af] transition-colors"
              >
                Change
              </button>
            </div>

            {/* Need Help? Card */}
            <div className="md:col-span-6 bg-white dark:bg-[#161614] rounded-2xl p-6 shadow-sm border border-[#e5e7eb] dark:border-[#2a2a28] flex flex-col justify-between">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#f3f4f6] dark:bg-[#222220] flex items-center justify-center shrink-0 text-[#111827] dark:text-white">
                  <Headphones className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111827] dark:text-white mb-1">
                    Need Help?
                  </h4>
                  <p className="text-xs text-[#6b7280] dark:text-[#9ca3af]">
                    For any delivery related queries, contact our support team.
                  </p>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={`https://wa.me/919539752725?text=${encodeURIComponent(
                    `Hi Udaya Support, I need help with my cycle delivery ${data.orderNumber}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Chat on WhatsApp
                </a>

                <a
                  href="tel:+919539752725"
                  className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#f3f4f6] dark:bg-[#222220] hover:bg-[#e5e7eb] dark:hover:bg-[#2a2a28] text-[#111827] dark:text-white text-xs font-semibold transition-all border border-[#e5e7eb] dark:border-[#2a2a28]"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Us
                </a>

                <a
                  href="mailto:support@udayacycles.com"
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#f3f4f6] dark:bg-[#222220] hover:bg-[#e5e7eb] dark:hover:bg-[#2a2a28] text-[#111827] dark:text-white text-xs font-semibold transition-all border border-[#e5e7eb] dark:border-[#2a2a28]"
                >
                  <Mail className="w-3.5 h-3.5" /> Email Support
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
