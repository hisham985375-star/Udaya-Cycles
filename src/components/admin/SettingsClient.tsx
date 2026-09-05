/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export function SettingsClient({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error("Failed to save settings");
      alert("Settings updated successfully!");
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface border border-border hover:border-accent transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </Link>
          <h1 className="text-3xl font-display font-bold text-text-primary uppercase tracking-tight">Store Settings</h1>
        </div>
        <button type="submit" disabled={loading} className="bg-accent text-bg font-bold px-6 py-3 rounded-full hover:bg-accent-dim transition-colors flex items-center gap-2 uppercase tracking-wide text-sm disabled:opacity-50">
          <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="space-y-8">
        
        {/* Global Toggles */}
        <div className="bg-surface-raised rounded-2xl border border-border p-6 space-y-6">
          <h2 className="font-bold text-text-primary uppercase tracking-wider border-b border-border pb-4">Shipping & Operations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-bold text-text-primary uppercase tracking-wide group-hover:text-accent transition-colors">Free Shipping Enabled</span>
                <div className="relative">
                  <input type="checkbox" checked={data.sitewide.freeShippingEnabled} onChange={e => handleNestedChange("sitewide", "freeShippingEnabled", e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-secondary peer-checked:after:bg-bg after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent border border-border"></div>
                </div>
              </label>

              {data.sitewide.freeShippingEnabled && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Free Shipping Threshold (₹)</label>
                  <input type="number" value={data.sitewide.freeShippingThreshold / 100} onChange={e => handleNestedChange("sitewide", "freeShippingThreshold", parseInt(e.target.value) * 100)} className="w-full bg-bg border border-border rounded-lg p-2 text-sm text-text-primary font-mono focus:border-accent outline-none" />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Standard Shipping Fee (₹)</label>
                <input type="number" value={data.sitewide.standardShippingFee / 100} onChange={e => handleNestedChange("sitewide", "standardShippingFee", parseInt(e.target.value) * 100)} className="w-full bg-bg border border-border rounded-lg p-2 text-sm text-text-primary font-mono focus:border-accent outline-none" />
              </div>
            </div>

            <div className="space-y-6">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="block text-sm font-bold text-error uppercase tracking-wide">Maintenance Mode</span>
                  <span className="text-xs text-text-muted">Temporarily disable storefront</span>
                </div>
                <div className="relative">
                  <input type="checkbox" checked={data.sitewide.maintenanceMode} onChange={e => handleNestedChange("sitewide", "maintenanceMode", e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-secondary peer-checked:after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-error border border-border"></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-surface-raised rounded-2xl border border-border p-6 space-y-6">
          <h2 className="font-bold text-text-primary uppercase tracking-wider border-b border-border pb-4">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Email Address</label>
              <input type="email" value={data.contact.email} onChange={e => handleNestedChange("contact", "email", e.target.value)} className="w-full bg-bg border border-border rounded-lg p-2 text-sm text-text-primary focus:border-accent outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Phone Number</label>
              <input type="text" value={data.contact.phone} onChange={e => handleNestedChange("contact", "phone", e.target.value)} className="w-full bg-bg border border-border rounded-lg p-2 text-sm text-text-primary focus:border-accent outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">WhatsApp Number</label>
              <input type="text" value={data.contact.whatsapp} onChange={e => handleNestedChange("contact", "whatsapp", e.target.value)} className="w-full bg-bg border border-border rounded-lg p-2 text-sm text-text-primary focus:border-accent outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Business Hours</label>
              <input type="text" value={data.contact.businessHours} onChange={e => handleNestedChange("contact", "businessHours", e.target.value)} className="w-full bg-bg border border-border rounded-lg p-2 text-sm text-text-primary focus:border-accent outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Headquarters Address</label>
              <textarea rows={2} value={data.contact.address} onChange={e => handleNestedChange("contact", "address", e.target.value)} className="w-full bg-bg border border-border rounded-lg p-2 text-sm text-text-primary focus:border-accent outline-none" />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-surface-raised rounded-2xl border border-border p-6 space-y-6">
          <h2 className="font-bold text-text-primary uppercase tracking-wider border-b border-border pb-4">Social Links</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Instagram URL</label>
              <input type="url" value={data.contact.instagram} onChange={e => handleNestedChange("contact", "instagram", e.target.value)} className="w-full bg-bg border border-border rounded-lg p-2 text-sm text-text-primary focus:border-accent outline-none" placeholder="https://instagram.com/..." />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Facebook URL</label>
              <input type="url" value={data.contact.facebook} onChange={e => handleNestedChange("contact", "facebook", e.target.value)} className="w-full bg-bg border border-border rounded-lg p-2 text-sm text-text-primary focus:border-accent outline-none" placeholder="https://facebook.com/..." />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">YouTube URL</label>
              <input type="url" value={data.contact.youtube} onChange={e => handleNestedChange("contact", "youtube", e.target.value)} className="w-full bg-bg border border-border rounded-lg p-2 text-sm text-text-primary focus:border-accent outline-none" placeholder="https://youtube.com/..." />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Twitter / X URL</label>
              <input type="url" value={data.contact.twitter} onChange={e => handleNestedChange("contact", "twitter", e.target.value)} className="w-full bg-bg border border-border rounded-lg p-2 text-sm text-text-primary focus:border-accent outline-none" placeholder="https://twitter.com/..." />
            </div>
          </div>
        </div>

      </div>
    </form>
  );
}
