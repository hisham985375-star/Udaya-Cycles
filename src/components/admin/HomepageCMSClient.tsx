/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from "lucide-react";

export function HomepageCMSClient({ initialData }: { initialData: any }) {
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
      alert("Homepage settings updated successfully!");
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

  const addWhyUdayaItem = () => {
    setData((prev: any) => ({
      ...prev,
      whyUdaya: {
        ...prev.whyUdaya,
        items: [...prev.whyUdaya.items, { title: "", description: "", icon: "" }]
      }
    }));
  };

  const removeWhyUdayaItem = (index: number) => {
    setData((prev: any) => {
      const newItems = [...prev.whyUdaya.items];
      newItems.splice(index, 1);
      return { ...prev, whyUdaya: { ...prev.whyUdaya, items: newItems } };
    });
  };

  const updateWhyUdayaItem = (index: number, field: string, value: string) => {
    setData((prev: any) => {
      const newItems = [...prev.whyUdaya.items];
      newItems[index][field] = value;
      return { ...prev, whyUdaya: { ...prev.whyUdaya, items: newItems } };
    });
  };

  const toggleSection = (index: number) => {
    setData((prev: any) => {
      const newSections = [...prev.sections];
      newSections[index].isVisible = !newSections[index].isVisible;
      return { ...prev, sections: newSections };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface border border-border hover:border-accent transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </Link>
          <h1 className="text-3xl font-display font-bold text-text-primary uppercase tracking-tight">Homepage CMS</h1>
        </div>
        <button type="submit" disabled={loading} className="bg-accent text-bg font-bold px-6 py-3 rounded-full hover:bg-accent-dim transition-colors flex items-center gap-2 uppercase tracking-wide text-sm disabled:opacity-50">
          <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Hero Section */}
          <div className="bg-surface-raised rounded-2xl border border-border overflow-hidden">
            <div className="bg-surface p-4 border-b border-border">
              <h2 className="font-bold text-text-primary uppercase tracking-wider">Hero Banner</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Headline</label>
                <input type="text" value={data.hero.headline} onChange={e => handleNestedChange("hero", "headline", e.target.value)} className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Subheadline</label>
                <textarea rows={2} value={data.hero.subheadline} onChange={e => handleNestedChange("hero", "subheadline", e.target.value)} className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">CTA Text</label>
                  <input type="text" value={data.hero.ctaText} onChange={e => handleNestedChange("hero", "ctaText", e.target.value)} className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">CTA URL</label>
                  <input type="text" value={data.hero.ctaUrl} onChange={e => handleNestedChange("hero", "ctaUrl", e.target.value)} className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Why Udaya Section */}
          <div className="bg-surface-raised rounded-2xl border border-border overflow-hidden">
            <div className="bg-surface p-4 border-b border-border">
              <h2 className="font-bold text-text-primary uppercase tracking-wider">Why Udaya Features</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Section Heading</label>
                  <input type="text" value={data.whyUdaya.heading} onChange={e => handleNestedChange("whyUdaya", "heading", e.target.value)} className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Subheading</label>
                  <input type="text" value={data.whyUdaya.subheading} onChange={e => handleNestedChange("whyUdaya", "subheading", e.target.value)} className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none" />
                </div>
              </div>
              
              <div className="space-y-4">
                {data.whyUdaya.items.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 bg-bg border border-border rounded-xl relative">
                    <button type="button" onClick={() => removeWhyUdayaItem(idx)} className="absolute top-2 right-2 p-2 text-text-muted hover:text-error"><Trash2 className="w-4 h-4" /></button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 pr-8">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">Title</label>
                        <input type="text" value={item.title} onChange={e => updateWhyUdayaItem(idx, "title", e.target.value)} className="w-full bg-surface border border-border rounded p-2 text-sm text-text-primary focus:border-accent outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">Icon (SVG or Lucide Name)</label>
                        <input type="text" value={item.icon} onChange={e => updateWhyUdayaItem(idx, "icon", e.target.value)} className="w-full bg-surface border border-border rounded p-2 text-sm text-text-primary focus:border-accent outline-none font-mono" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">Description</label>
                      <textarea rows={2} value={item.description} onChange={e => updateWhyUdayaItem(idx, "description", e.target.value)} className="w-full bg-surface border border-border rounded p-2 text-sm text-text-primary focus:border-accent outline-none" />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addWhyUdayaItem} className="w-full border border-dashed border-border text-text-secondary font-bold py-3 rounded-xl hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2 uppercase tracking-wide text-sm"><Plus className="w-4 h-4" /> Add Feature</button>
              </div>
            </div>
          </div>

          {/* Promo Closure */}
          <div className="bg-surface-raised rounded-2xl border border-border overflow-hidden">
            <div className="bg-surface p-4 border-b border-border">
              <h2 className="font-bold text-text-primary uppercase tracking-wider">Bottom Promo Banner</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Heading</label>
                  <input type="text" value={data.promoClosure.heading} onChange={e => handleNestedChange("promoClosure", "heading", e.target.value)} className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Subheading</label>
                  <input type="text" value={data.promoClosure.subheading} onChange={e => handleNestedChange("promoClosure", "subheading", e.target.value)} className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Primary CTA Text</label>
                  <input type="text" value={data.promoClosure.primaryCtaText} onChange={e => handleNestedChange("promoClosure", "primaryCtaText", e.target.value)} className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Primary URL</label>
                  <input type="text" value={data.promoClosure.primaryCtaUrl} onChange={e => handleNestedChange("promoClosure", "primaryCtaUrl", e.target.value)} className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          
          {/* Section Visibility */}
          <div className="bg-surface-raised rounded-2xl border border-border overflow-hidden">
            <div className="bg-surface p-4 border-b border-border">
              <h2 className="font-bold text-text-primary uppercase tracking-wider text-sm">Homepage Layout</h2>
            </div>
            <div className="p-2 space-y-1">
              {data.sections.map((section: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-surface transition-colors">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-text-muted cursor-move" />
                    <span className={`text-sm font-medium uppercase tracking-wider ${section.isVisible ? 'text-text-primary' : 'text-text-muted line-through'}`}>
                      {section.key.replace('_', ' ')}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={section.isVisible} onChange={() => toggleSection(idx)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-bg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-secondary peer-checked:after:bg-bg after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent border border-border"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}
