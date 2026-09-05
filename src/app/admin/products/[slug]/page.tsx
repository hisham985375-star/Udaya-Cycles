/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from "@/lib/db/mongoose";
import Product from "@/models/Product";
import ProductVariant from "@/models/ProductVariant";
import { notFound } from "next/navigation";
import { ProductFormClient } from "@/components/admin/ProductFormClient";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  await connectDB();
  
  const resolvedParams = await params;
  const product = await Product.findOne({ slug: resolvedParams.slug }).lean();

  if (!product) {
    notFound();
  }

  // Fetch variants if applicable
  let variants: any[] = [];
  if (product.hasVariants) {
    variants = await ProductVariant.find({ product: product._id }).lean();
  }

  // Convert ObjectIds to strings to pass safely to Client Component
  const serializedProduct = JSON.parse(JSON.stringify(product));
  
  // Create comboString for UI matching
  const serializedVariants = JSON.parse(JSON.stringify(variants)).map((v: any) => ({
    ...v,
    comboString: Object.values(v.attributes).join(" / ")
  }));

  const initialData = {
    ...serializedProduct,
    variants: serializedVariants
  };

  return <ProductFormClient initialData={initialData} />;
}
