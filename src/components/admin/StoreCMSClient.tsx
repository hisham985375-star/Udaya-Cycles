/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, GripVertical, MapPin } from "lucide-react";

export function StoreCMSClient({ initialStores }: { initialStores: any[] }) {
  const router = useRouter();
  const [stores, setStores] = useState(initialStores);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/content/stores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stores })
      });

      if (!res.ok) throw new Error("Failed to save stores");
      alert("Store locations updated successfully!");
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addStore = () => {
    setStores([...stores, { 
      name: "", address: "", city: "", state: "", pinCode: "", phone: "",
      isActive: true,
      hours: [
        { day: "Mon-Sat", open: "09:00", close: "20:00", isClosed: false },
        { day: "Sunday", open: "10:00", close: "18:00", isClosed: false }
      ]
    }]);
  };

  const removeStore = (index: number) => {
    const newStores = [...stores];
    newStores.splice(index, 1);
    setStores(newStores);
  };

  const updateStore = (index: number, field: string, value: any) => {
    const newStores = [...stores];
    newStores[index][field] = value;
    setStores(newStores);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface border border-border hover:border-accent transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </Link>
          <h1 className="text-3xl font-display font-bold text-text-primary uppercase tracking-tight">Store Locations CMS</h1>
        </div>
        <button type="submit" disabled={loading} className="bg-accent text-bg font-bold px-6 py-3 rounded-full hover:bg-accent-dim transition-colors flex items-center gap-2 uppercase tracking-wide text-sm disabled:opacity-50">
          <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Locations"}
        </button>
      </div>

      <div className="bg-surface-raised rounded-2xl border border-border p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {stores.map((store, idx) => (
            <div key={idx} className="bg-bg border border-border rounded-xl p-4 flex gap-4 items-start relative overflow-hidden">
              <div className="mt-2 text-text-muted cursor-move">
                <GripVertical className="w-5 h-5" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">Store Name</label>
                    <input type="text" value={store.name} onChange={e => updateStore(idx, "name", e.target.value)} className="w-full bg-surface border border-border rounded p-2 text-sm text-text-primary focus:border-accent outline-none" required placeholder="e.g. Udaya Cycles - Koramangala" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">Phone</label>
                    <input type="text" value={store.phone} onChange={e => updateStore(idx, "phone", e.target.value)} className="w-full bg-surface border border-border rounded p-2 text-sm text-text-primary focus:border-accent outline-none" required />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">Address Line</label>
                  <input type="text" value={store.address} onChange={e => updateStore(idx, "address", e.target.value)} className="w-full bg-surface border border-border rounded p-2 text-sm text-text-primary focus:border-accent outline-none" required />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">City</label>
                    <input type="text" value={store.city} onChange={e => updateStore(idx, "city", e.target.value)} className="w-full bg-surface border border-border rounded p-2 text-sm text-text-primary focus:border-accent outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">State</label>
                    <input type="text" value={store.state} onChange={e => updateStore(idx, "state", e.target.value)} className="w-full bg-surface border border-border rounded p-2 text-sm text-text-primary focus:border-accent outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">PIN</label>
                    <input type="text" value={store.pinCode} onChange={e => updateStore(idx, "pinCode", e.target.value)} className="w-full bg-surface border border-border rounded p-2 text-sm text-text-primary focus:border-accent outline-none" required />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer w-max pt-2">
                  <input type="checkbox" checked={store.isActive} onChange={e => updateStore(idx, "isActive", e.target.checked)} className="accent-accent w-3 h-3" />
                  <span className="text-[10px] font-bold text-text-secondary uppercase">Active Location</span>
                </label>
              </div>

              <button type="button" onClick={() => removeStore(idx)} className="absolute top-4 right-4 text-text-muted hover:text-error p-2"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        
        <button type="button" onClick={addStore} className="w-full border border-dashed border-border text-text-secondary font-bold py-4 rounded-xl hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2 uppercase tracking-wide text-sm"><MapPin className="w-4 h-4" /> Add Store Location</button>
      </div>
    </form>
  );
}
