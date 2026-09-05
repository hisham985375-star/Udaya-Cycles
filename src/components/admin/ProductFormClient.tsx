/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Plus, X, UploadCloud, Save, Trash2 } from "lucide-react";

export function ProductFormClient({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<{categories: any[], brands: any[]}>({ categories: [], brands: [] });

  // Basic Details
  const [name, setName] = useState(initialData?.name || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [type, setType] = useState(initialData?.type || "cycle");
  const [category, setCategory] = useState(initialData?.category || "");
  const [brand, setBrand] = useState(initialData?.brand || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [size, setSize] = useState(initialData?.size?.toString() || "");
  
  // Pricing & Inventory (Base)
  const [regularPrice, setRegularPrice] = useState(initialData ? (initialData.regularPrice / 100).toString() : ""); 
  const [salePrice, setSalePrice] = useState(initialData?.salePrice ? (initialData.salePrice / 100).toString() : "");
  const [stock, setStock] = useState(initialData?.stock?.toString() || "");
  const [hasVariants, setHasVariants] = useState(initialData?.hasVariants || false);

  // New Arrivals
  const [isNewArrival, setIsNewArrival] = useState(initialData?.isNewArrival || false);
  const [newArrivalOrder, setNewArrivalOrder] = useState(initialData?.newArrivalOrder?.toString() || "0");

  // Specifications
  const [specifications, setSpecifications] = useState<{groupName: string, fields: {label: string, value: string}[]}[]>(initialData?.specifications || []);

  // Variants
  const [variantAttributes, setVariantAttributes] = useState<{name: string, values: string[]}[]>(initialData?.variantAttributes || []);
  const [variants, setVariants] = useState<any[]>(initialData?.variants || []);

  // Images
  const [images, setImages] = useState<{url: string, publicId: string, isDefault: boolean, sortOrder: number}[]>(initialData?.images || []);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/metadata")
      .then(res => res.json())
      .then(data => setMetadata(data))
      .catch(console.error);
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setImages(prev => [...prev, {
        url: data.secure_url,
        publicId: data.public_id,
        isDefault: prev.length === 0,
        sortOrder: prev.length
      }]);
    } catch (error: any) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (publicId: string) => {
    setImages(prev => prev.filter(img => img.publicId !== publicId));
  };

  const addSpecGroup = () => {
    setSpecifications([...specifications, { groupName: "", fields: [{label: "", value: ""}] }]);
  };

  const updateSpecGroup = (index: number, name: string) => {
    const newSpecs = [...specifications];
    newSpecs[index]!.groupName = name;
    setSpecifications(newSpecs);
  };

  const addSpecField = (groupIndex: number) => {
    const newSpecs = [...specifications];
    newSpecs[groupIndex]!.fields.push({label: "", value: ""});
    setSpecifications(newSpecs);
  };

  const updateSpecField = (groupIndex: number, fieldIndex: number, key: "label"|"value", val: string) => {
    const newSpecs = [...specifications];
    newSpecs[groupIndex]!.fields[fieldIndex]![key] = val;
    setSpecifications(newSpecs);
  };

  const addVariantAttribute = () => {
    setVariantAttributes([...variantAttributes, { name: "", values: [] }]);
  };

  const updateVariantAttribute = (index: number, name: string) => {
    const newAttr = [...variantAttributes];
    newAttr[index]!.name = name;
    setVariantAttributes(newAttr);
  };

  const updateVariantAttributeValues = (index: number, valuesStr: string) => {
    const newAttr = [...variantAttributes];
    newAttr[index]!.values = valuesStr.split(",").map(s => s.trim()).filter(Boolean);
    setVariantAttributes(newAttr);
  };

  // Cartesian product generator for variants
  const generateVariants = () => {
    if (variantAttributes.length === 0) return;
    
    // Quick cartesian product
    const cartesian = (arrays: string[][]) => {
      return arrays.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())), [[]] as string[][]);
    };

    const valuesArrays = variantAttributes.map(attr => attr.values);
    if (valuesArrays.some(arr => arr.length === 0)) return;

    const combinations = cartesian(valuesArrays);
    
    const newVariants = combinations.map((combo) => {
      const attrs = new Map();
      variantAttributes.forEach((attr, i) => {
        attrs.set(attr.name, combo[i]);
      });
      
      const suffix = combo.join("-").toUpperCase();
      return {
        attributes: Object.fromEntries(attrs),
        sku: `${sku}-${suffix}`,
        regularPrice: regularPrice ? parseInt(regularPrice) * 100 : 0,
        salePrice: salePrice ? parseInt(salePrice) * 100 : 0,
        stock: 0,
        comboString: combo.join(" / ")
      };
    });

    setVariants(newVariants);
  };

  const updateVariant = (index: number, field: string, val: string) => {
    const newVariants = [...variants];
    newVariants[index]![field] = field === "sku" ? val : (val ? parseInt(val) * 100 : 0);
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name,
        sku,
        type,
        category: category || undefined,
        brand: brand || undefined,
        description,
        size: size || undefined,
        regularPrice: parseInt(regularPrice) * 100,
        salePrice: salePrice ? parseInt(salePrice) * 100 : undefined,
        stock: parseInt(stock) || 0,
        images,
        specifications,
        hasVariants,
        variantAttributes,
        variants,
        isNewArrival,
        newArrivalOrder: parseInt(newArrivalOrder) || 0
      };

      const url = initialData ? `/api/admin/products/${initialData._id}` : "/api/admin/products";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.back();
      router.refresh();
    } catch (error: any) {
      alert("Error saving product: " + error.message);
      setLoading(false);
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface border border-border hover:border-accent transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </button>
          <h1 className="text-3xl font-display font-bold text-text-primary uppercase tracking-tight">{initialData ? "Edit Product" : "Create Product"}</h1>
        </div>
        <button type="submit" disabled={loading} className="bg-accent text-bg font-bold px-6 py-3 rounded-full hover:bg-accent-dim transition-colors flex items-center gap-2 uppercase tracking-wide text-sm disabled:opacity-50">
          <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Product"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col - Main Form */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Basic Details */}
          <div className="bg-surface-raised rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold text-text-primary uppercase tracking-wide mb-6">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Product Name <span className="text-error">*</span></label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none" placeholder="e.g. Udaya Phantom X" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">SKU <span className="text-error">*</span></label>
                  <input required type="text" value={sku} onChange={e => setSku(e.target.value)} className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none font-mono" placeholder="PHAN-X-01" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Type</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none appearance-none">
                    <option value="cycle" className="text-black">Cycle</option>
                    <option value="accessory" className="text-black">Accessory</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Size</label>
                  <select value={size} onChange={e => setSize(e.target.value)} className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none appearance-none font-mono">
                    <option value="" className="text-black">Select Size...</option>
                    <option value="12" className="text-black">12</option>
                    <option value="14" className="text-black">14</option>
                    <option value="16" className="text-black">16</option>
                    <option value="20" className="text-black">20</option>
                    <option value="24" className="text-black">24</option>
                    <option value="26" className="text-black">26</option>
                    <option value="27.5" className="text-black">27.5</option>
                    <option value="29" className="text-black">29</option>
                    <option value="700C" className="text-black">700C</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Description</label>
                <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none" placeholder="Detailed product description..."></textarea>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-surface-raised rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-text-primary uppercase tracking-wide">Pricing & Inventory</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={hasVariants} onChange={e => setHasVariants(e.target.checked)} className="accent-accent w-4 h-4" />
                <span className="text-sm font-bold text-text-secondary uppercase">Product has variants</span>
              </label>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Regular Price (₹) <span className="text-error">*</span></label>
                <input required type="number" min="0" value={regularPrice} onChange={e => setRegularPrice(e.target.value)} className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none font-mono" placeholder="15000" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Sale Price (₹)</label>
                <input type="number" min="0" value={salePrice} onChange={e => setSalePrice(e.target.value)} className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none font-mono" placeholder="12000" />
              </div>
              {!hasVariants && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Stock Quantity</label>
                  <input required={!hasVariants} type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none font-mono" placeholder="50" />
                </div>
              )}
            </div>
          </div>

          {/* Variants Configuration */}
          {hasVariants && (
            <div className="bg-surface-raised rounded-2xl border border-border p-6">
              <h2 className="text-lg font-bold text-text-primary uppercase tracking-wide mb-6">Variant Generation</h2>
              <div className="space-y-4 mb-6">
                {variantAttributes.map((attr, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="flex-1">
                      <input type="text" value={attr.name} onChange={e => updateVariantAttribute(idx, e.target.value)} placeholder="e.g. Color" className="w-full bg-bg border border-border rounded-lg p-2 text-sm text-text-primary focus:border-accent outline-none mb-2" />
                    </div>
                    <div className="flex-[2]">
                      <input type="text" value={attr.values.join(", ")} onChange={e => updateVariantAttributeValues(idx, e.target.value)} placeholder="Red, Blue, Green (comma separated)" className="w-full bg-bg border border-border rounded-lg p-2 text-sm text-text-primary focus:border-accent outline-none" />
                    </div>
                    <button type="button" onClick={() => setVariantAttributes(variantAttributes.filter((_, i) => i !== idx))} className="p-2 text-text-muted hover:text-error"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button type="button" onClick={addVariantAttribute} className="text-accent text-sm font-bold uppercase tracking-wide flex items-center gap-1"><Plus className="w-4 h-4" /> Add Option</button>
              </div>

              {variantAttributes.length > 0 && (
                <button type="button" onClick={generateVariants} className="w-full bg-surface border border-border font-bold py-2 rounded-lg hover:border-accent transition-colors mb-6 text-sm uppercase">Generate Variants Grid</button>
              )}

              {variants.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border text-text-secondary uppercase tracking-widest text-xs">
                        <th className="p-2">Variant</th>
                        <th className="p-2">SKU</th>
                        <th className="p-2">Price (₹)</th>
                        <th className="p-2">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((variant, idx) => (
                        <tr key={idx} className="border-b border-border/50">
                          <td className="p-2 font-medium">{variant.comboString}</td>
                          <td className="p-2"><input type="text" value={variant.sku} onChange={e => updateVariant(idx, 'sku', e.target.value)} className="w-full bg-bg border border-border rounded p-1 font-mono text-xs" /></td>
                          <td className="p-2"><input type="number" value={variant.regularPrice / 100} onChange={e => updateVariant(idx, 'regularPrice', e.target.value)} className="w-full bg-bg border border-border rounded p-1 font-mono text-xs" /></td>
                          <td className="p-2"><input type="number" value={variant.stock} onChange={e => updateVariant(idx, 'stock', e.target.value)} className="w-full bg-bg border border-border rounded p-1 font-mono text-xs" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Specifications */}
          <div className="bg-surface-raised rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold text-text-primary uppercase tracking-wide mb-6">Specifications</h2>
            <div className="space-y-8">
              {specifications.map((group, gIdx) => (
                <div key={gIdx} className="bg-bg border border-border p-4 rounded-xl relative">
                  <button type="button" onClick={() => setSpecifications(specifications.filter((_, i) => i !== gIdx))} className="absolute top-4 right-4 text-text-muted hover:text-error"><Trash2 className="w-4 h-4" /></button>
                  <input type="text" value={group.groupName} onChange={e => updateSpecGroup(gIdx, e.target.value)} placeholder="Group Name (e.g. Frame Set)" className="bg-transparent text-text-primary font-bold uppercase tracking-wider outline-none border-b border-border focus:border-accent pb-1 mb-4 w-64" />
                  
                  <div className="space-y-2">
                    {group.fields.map((field, fIdx) => (
                      <div key={fIdx} className="flex gap-2">
                        <input type="text" value={field.label} onChange={e => updateSpecField(gIdx, fIdx, "label", e.target.value)} placeholder="Label (e.g. Fork)" className="flex-1 bg-surface border border-border rounded p-2 text-sm text-text-primary focus:border-accent outline-none" />
                        <input type="text" value={field.value} onChange={e => updateSpecField(gIdx, fIdx, "value", e.target.value)} placeholder="Value (e.g. Carbon Fiber)" className="flex-[2] bg-surface border border-border rounded p-2 text-sm text-text-primary focus:border-accent outline-none" />
                        <button type="button" onClick={() => {
                          const newSpecs = [...specifications];
                          newSpecs[gIdx]!.fields = newSpecs[gIdx]!.fields.filter((_, i) => i !== fIdx);
                          setSpecifications(newSpecs);
                        }} className="p-2 text-text-muted hover:text-error"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addSpecField(gIdx)} className="text-text-secondary text-xs font-bold uppercase hover:text-accent flex items-center gap-1 mt-2"><Plus className="w-3 h-3" /> Add Field</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addSpecGroup} className="w-full border border-dashed border-border text-text-secondary font-bold py-4 rounded-xl hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2 uppercase tracking-wide text-sm"><Plus className="w-4 h-4" /> Add Specification Group</button>
            </div>
          </div>
        </div>

        {/* Right Col - Organization & Images */}
        <div className="space-y-8">
          
          <div className="bg-surface-raised rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold text-text-primary uppercase tracking-wide mb-6">Organization</h2>
            <div className="space-y-4">
              <div className="pb-4 border-b border-border mb-4">
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input type="checkbox" checked={isNewArrival} onChange={e => setIsNewArrival(e.target.checked)} className="accent-accent w-4 h-4" />
                  <span className="text-sm font-bold text-text-secondary uppercase">Show in New Arrivals</span>
                </label>
                {isNewArrival && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Display Order (1 is first)</label>
                    <input type="number" min="0" value={newArrivalOrder} onChange={e => setNewArrivalOrder(e.target.value)} className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none font-mono" placeholder="1" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none appearance-none">
                  <option value="" className="text-black">Select Category...</option>
                  {metadata.categories.map((c: any) => (
                    <option key={c._id} value={c._id} className="text-black">{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Brand</label>
                <select value={brand} onChange={e => setBrand(e.target.value)} className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none appearance-none">
                  <option value="" className="text-black">Select Brand...</option>
                  {metadata.brands.map((b: any) => (
                    <option key={b._id} value={b._id} className="text-black">{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-surface-raised rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold text-text-primary uppercase tracking-wide mb-6">Product Images</h2>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              {images.map((img) => (
                <div key={img.publicId} className="aspect-square bg-bg rounded-lg border border-border relative overflow-hidden group">
                  <Image src={img.url} alt="Product image" fill className="object-cover cursor-pointer" onClick={() => setPreviewImage(img.url)} />
                  <button type="button" onClick={() => removeImage(img.publicId)} className="absolute top-1 right-1 w-6 h-6 bg-error text-bg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                  {img.isDefault && <div className="absolute bottom-0 inset-x-0 bg-accent text-bg text-[10px] font-bold uppercase tracking-widest text-center py-0.5 pointer-events-none">Primary</div>}
                </div>
              ))}
            </div>

            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer bg-bg hover:border-accent transition-colors relative">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-6 h-6 text-text-muted mb-2" />
                <p className="text-sm text-text-secondary font-medium">{uploadingImage ? "Uploading..." : "Click to upload image"}</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
            </label>
          </div>

        </div>
      </div>
    </form>
    
    {previewImage && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
        <div className="relative w-[90vw] h-[90vh] max-w-5xl max-h-[800px]" onClick={e => e.stopPropagation()}>
          <Image src={previewImage} alt="Preview" fill className="object-contain" />
          <button type="button" onClick={() => setPreviewImage(null)} className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors">
            <X className="w-8 h-8" />
          </button>
        </div>
      </div>
    )}
    </>
  );
}
