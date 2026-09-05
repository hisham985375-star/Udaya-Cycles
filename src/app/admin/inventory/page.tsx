/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from "@/lib/db/mongoose";
import Product from "@/models/Product";
import ProductVariant from "@/models/ProductVariant";
import { getAdminSession } from "@/lib/auth/admin-auth";
import { InventoryClient } from "@/components/admin/InventoryClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  await connectDB();
  
  const products = await Product.find({ deletedAt: null }).select("name sku stock hasVariants regularPrice").lean();
  const variants = await ProductVariant.find().select("product sku stock regularPrice attributes").lean();
  
  const variantMap: Record<string, any[]> = {};
  for (const v of variants) {
    const pid = String(v.product);
    if (!variantMap[pid]) variantMap[pid] = [];
    variantMap[pid].push(v);
  }

  const inventoryList = products.map(p => ({
    _id: String(p._id),
    name: p.name,
    sku: p.sku,
    hasVariants: p.hasVariants,
    stock: p.stock,
    price: p.regularPrice,
    isVariant: false,
    variants: p.hasVariants ? (variantMap[String(p._id)] || []).map(v => ({
      _id: String(v._id),
      name: Object.values(v.attributes).join(" / "),
      sku: v.sku,
      stock: v.stock,
      price: v.regularPrice,
      isVariant: true
    })) : []
  }));

  const sanitizedInventory = JSON.parse(JSON.stringify(inventoryList));

  return <InventoryClient initialInventory={sanitizedInventory} />;
}
