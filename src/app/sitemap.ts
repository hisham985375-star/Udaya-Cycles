import { MetadataRoute } from "next";
import { connectDB } from "@/lib/db/mongoose";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  await connectDB();

  // Fetch dynamic routes
  const products = await Product.find({ isActive: true, deletedAt: null }).select("slug updatedAt").lean();
  const categories = await Category.find({ isActive: true }).select("slug updatedAt").lean();
  const brands = await Brand.find({ isActive: true }).select("slug updatedAt").lean();

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryUrls = categories.map((category) => ({
    url: `${baseUrl}/cycles/category/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const brandUrls = brands.map((brand) => ({
    url: `${baseUrl}/cycles/brand/${brand.slug}`,
    lastModified: brand.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/accessories`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/stores`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...productUrls,
    ...categoryUrls,
    ...brandUrls,
  ];
}
