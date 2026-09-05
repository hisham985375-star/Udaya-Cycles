/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import Product from "@/models/Product";
import ProductVariant from "@/models/ProductVariant";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";

export const revalidate = 3600; // 1 hour ISR

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();
  const product = await Product.findOne({ slug, isActive: true, deletedAt: null }).lean();
  
  if (!product) return { title: "Not Found" };
  
  return {
    title: product.seo?.title || `${product.name} | Udaya Cycles`,
    description: product.seo?.description || product.description,
    openGraph: {
      title: product.seo?.title || `${product.name} | Udaya Cycles`,
      description: product.seo?.description || product.description,
      images: product.images?.[0]?.url ? [{ url: product.images[0].url }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.seo?.title || `${product.name} | Udaya Cycles`,
      description: product.seo?.description || product.description,
      images: product.images?.[0]?.url ? [product.images[0].url] : [],
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();

  const product = await Product.findOne({ slug, isActive: true, deletedAt: null })
    .populate("brand", "name")
    .lean();

  if (!product) {
    notFound();
  }

  // Fetch variants if applicable
  let variants: any[] = [];
  if (product.hasVariants) {
    variants = await ProductVariant.find({ product: product._id, isActive: true }).lean();
  }

  // Convert ObjectIds to strings to pass to Client Component safely
  const serializedProduct = JSON.parse(JSON.stringify(product));
  const serializedVariants = JSON.parse(JSON.stringify(variants));

  return (
    <div className="section-padding bg-bg">
      <div className="container-udaya">
        <ProductDetailClient product={serializedProduct} variants={serializedVariants} />
      </div>
    </div>
  );
}
