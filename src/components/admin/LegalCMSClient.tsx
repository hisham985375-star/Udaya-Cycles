/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

const LEGAL_KEYS = [
  { key: "privacy-policy", label: "Privacy Policy" },
  { key: "terms", label: "Terms of Service" },
  { key: "shipping-policy", label: "Shipping Policy" },
  { key: "refund-policy", label: "Refund Policy" }
];

export function LegalCMSClient({ initialPages }: { initialPages: any[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(LEGAL_KEYS[0]!.key);
  
  // Transform initial array into a keyed object for easy state management
  const [data, setData] = useState<Record<string, { title: string, content: string }>>(() => {
    const map: Record<string, any> = {};
    LEGAL_KEYS.forEach(k => {
      const existing = initialPages.find(p => p.key === k.key);
      map[k.key] = {
        title: existing?.title || k.label,
        content: existing?.content || ""
      };
    });
    return map;
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const activeData = data[activeTab]!;
      const res = await fetch("/api/admin/content/legal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: activeTab,
          title: activeData.title,
          content: activeData.content
        })
      });

      if (!res.ok) throw new Error("Failed to save legal page");
      alert(`${LEGAL_KEYS.find(k => k.key === activeTab)?.label} saved successfully!`);
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDataChange = (field: "title" | "content", value: string) => {
    setData(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab]!,
        [field]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface border border-border hover:border-accent transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </Link>
          <h1 className="text-3xl font-display font-bold text-text-primary uppercase tracking-tight">Legal Pages CMS</h1>
        </div>
        <button type="submit" disabled={loading} className="bg-accent text-bg font-bold px-6 py-3 rounded-full hover:bg-accent-dim transition-colors flex items-center gap-2 uppercase tracking-wide text-sm disabled:opacity-50">
          <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Page"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar - Tabs */}
        <div className="space-y-2">
          {LEGAL_KEYS.map((k) => (
            <button
              key={k.key}
              type="button"
              onClick={() => setActiveTab(k.key)}
              className={`w-full text-left px-4 py-3 rounded-lg font-bold uppercase tracking-wide text-sm transition-colors ${
                activeTab === k.key ? "bg-accent text-bg" : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-accent"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-surface-raised rounded-2xl border border-border overflow-hidden">
            <div className="bg-surface p-4 border-b border-border">
              <h2 className="font-bold text-text-primary uppercase tracking-wider">Editing: {LEGAL_KEYS.find(k => k.key === activeTab)?.label}</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Page Title</label>
                <input 
                  type="text" 
                  value={data[activeTab]!.title} 
                  onChange={e => handleDataChange("title", e.target.value)} 
                  className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Content (Markdown / HTML supported via frontend render)</label>
                <textarea 
                  rows={20} 
                  value={data[activeTab]!.content} 
                  onChange={e => handleDataChange("content", e.target.value)} 
                  className="w-full bg-bg border border-border rounded-lg p-4 text-text-primary focus:border-accent outline-none font-mono text-sm leading-relaxed" 
                  placeholder="Enter policy content here..."
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
