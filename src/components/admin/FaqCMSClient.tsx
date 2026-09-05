/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from "lucide-react";

export function FaqCMSClient({ initialFaqs }: { initialFaqs: any[] }) {
  const router = useRouter();
  const [faqs, setFaqs] = useState(initialFaqs);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/content/faq", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faqs })
      });

      if (!res.ok) throw new Error("Failed to save FAQs");
      alert("FAQs updated successfully!");
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "", category: "General", isActive: true }]);
  };

  const removeFaq = (index: number) => {
    const newFaqs = [...faqs];
    newFaqs.splice(index, 1);
    setFaqs(newFaqs);
  };

  const updateFaq = (index: number, field: string, value: any) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface border border-border hover:border-accent transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </Link>
          <h1 className="text-3xl font-display font-bold text-text-primary uppercase tracking-tight">FAQ CMS</h1>
        </div>
        <button type="submit" disabled={loading} className="bg-accent text-bg font-bold px-6 py-3 rounded-full hover:bg-accent-dim transition-colors flex items-center gap-2 uppercase tracking-wide text-sm disabled:opacity-50">
          <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save FAQs"}
        </button>
      </div>

      <div className="bg-surface-raised rounded-2xl border border-border p-6 space-y-6">
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-bg border border-border rounded-xl p-4 flex gap-4 items-start">
              <div className="mt-2 text-text-muted cursor-move">
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">Question</label>
                    <input type="text" value={faq.question} onChange={e => updateFaq(idx, "question", e.target.value)} className="w-full bg-surface border border-border rounded p-2 text-sm text-text-primary focus:border-accent outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">Category</label>
                    <input type="text" value={faq.category} onChange={e => updateFaq(idx, "category", e.target.value)} className="w-full bg-surface border border-border rounded p-2 text-sm text-text-primary focus:border-accent outline-none" placeholder="e.g. Shipping" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">Answer</label>
                  <textarea rows={3} value={faq.answer} onChange={e => updateFaq(idx, "answer", e.target.value)} className="w-full bg-surface border border-border rounded p-2 text-sm text-text-primary focus:border-accent outline-none" required />
                </div>
                <label className="flex items-center gap-2 cursor-pointer w-max">
                  <input type="checkbox" checked={faq.isActive} onChange={e => updateFaq(idx, "isActive", e.target.checked)} className="accent-accent w-3 h-3" />
                  <span className="text-[10px] font-bold text-text-secondary uppercase">Visible on site</span>
                </label>
              </div>
              <button type="button" onClick={() => removeFaq(idx)} className="text-text-muted hover:text-error p-2"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        
        <button type="button" onClick={addFaq} className="w-full border border-dashed border-border text-text-secondary font-bold py-4 rounded-xl hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2 uppercase tracking-wide text-sm"><Plus className="w-4 h-4" /> Add FAQ</button>
      </div>
    </form>
  );
}
