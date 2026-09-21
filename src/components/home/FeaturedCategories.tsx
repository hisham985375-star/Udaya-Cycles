/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db/mongoose";
import Category from "@/models/Category";
import { FeaturedCategoriesClient } from "./FeaturedCategoriesClient";

export async function FeaturedCategories() {
  await connectDB();
  
  // Fetch all active categories except 'City'
  const categories = await Category.find({ isActive: true, name: { $ne: 'City' } })
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  if (!categories || categories.length === 0) return null;

  // Serialize object IDs
  const serializedCategories = JSON.parse(JSON.stringify(categories));

  return <FeaturedCategoriesClient categories={serializedCategories} />;
}
