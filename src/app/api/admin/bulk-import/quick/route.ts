import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { getAdminSession } from "@/lib/auth/admin-auth";
import Product from "@/models/Product";
import Category from "@/models/Category";

function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

export async function POST(request: Request) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { products, settings } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "No products provided" }, { status: 400 });
    }

    await connectDB();

    // Cache categories to avoid DB lookups for every row
    const categoryCache = new Map<string, string>();

    let importedCount = 0;

    for (const p of products) {
      if (!p.name) continue;

      let categoryId = undefined;
      const catName = p.categoryName?.trim();
      
      if (catName) {
        const cacheKey = catName.toLowerCase();
        if (categoryCache.has(cacheKey)) {
          categoryId = categoryCache.get(cacheKey);
        } else {
          // Lookup category by name
          let cat = await Category.findOne({ name: new RegExp(`^${catName}$`, 'i') });
          if (!cat) {
            // Create it if it doesn't exist
            cat = await Category.create({
              name: catName,
              slug: slugify(catName) + '-' + Date.now().toString().slice(-4),
            });
          }
          categoryId = cat._id;
          categoryCache.set(cacheKey, cat._id.toString());
        }
      }

      // Generate a unique slug and SKU for the product
      const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
      const productSlug = slugify(p.name) + '-' + Date.now().toString().slice(-6) + randomStr.toLowerCase();
      const sku = `SKU-${Date.now().toString().slice(-6)}-${randomStr}`;

      const newProductData: any = {
        name: p.name,
        slug: productSlug,
        sku: sku,
        description: `Imported from Quick Paste`,
        type: settings.defaultProductType || "cycle",
        brand: settings.defaultBrandId || undefined,
        category: categoryId,
        isActive: true,
        size: p.size || undefined,
        images: [],
        videos: [],
        specifications: [],
        variantAttributes: [],
        hasVariants: false
      };

      // Set pricing and stock if provided (prices in paise)
      newProductData.regularPrice = settings.regularPrice ? Number(settings.regularPrice) * 100 : 0;
      if (settings.salePrice) newProductData.salePrice = Number(settings.salePrice) * 100;
      if (settings.stockQuantity) newProductData.stock = Number(settings.stockQuantity);

      await Product.create(newProductData);
      importedCount++;
    }

    return NextResponse.json({ success: true, importedCount });
  } catch (err: any) {
    console.error("[Quick Paste Import Error]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
