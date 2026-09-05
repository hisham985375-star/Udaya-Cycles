import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside .env.local");
  process.exit(1);
}

// Simple schemas
const BrandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }
}, { timestamps: true });

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  sku: { type: String, required: true, unique: true },
  type: { type: String, default: "cycle" },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
  regularPrice: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  images: { type: Array, default: [] },
  videos: { type: Array, default: [] },
}, { timestamps: true, strict: false }); // strict: false allows missing fields from original model

const Brand = mongoose.models.Brand || mongoose.model("Brand", BrandSchema);
const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

const productNames = [
  "LEGION SR", "LEGION TT", "MOOKI", "MOOKI TT", "PRIME IBC", "JUNGLE JOY IBC",
  "MOOKI", "LEGION SR", "LEGION IBC", "MADMAX TT", "PRIME", "JUNGLE JOY IBC",
  "PRIME IBC", "MOOKI", "LEGION SR", "MADRID TT", "MADMAX TT", "ROME TT",
  "ENZO 2.0", "MADRID IBC", "ENZO 2.0 IBC", "ENZO 3.0", "LEGION SR", "JUNGLE JOY",
  "PRIME IBC", "JUNGLE JOY IBC", "LEGION ZX", "LEGION TT IBC", "ROME TT",
  "ROME IBC", "MADMAX TT", "MADRID TT IBC", "ENZO 2.0", "ZANDER VB", "ZANDER DD",
  "ENZO 2.0 IBC", "ENZO XLR", "ENZO 3.0 IBC", "ENZO 3.0 FSDD", "PRIME 3.0",
  "SIENNA", "SIENNA", "LEGION VB", "LEGION DD IBC", "MAVIK VB", "ROME VB",
  "ROME DD IBC", "LEGION DD", "MAVIK FSDD", "ROME FSDD", "ROME FSDD IBC",
  "ZION FSDD", "ENZO XLR", "ENZO XLR 3.0", "SYNC", "SYNC", "LEGION DD",
  "LEGION VB IBC", "MAVIK VB IBC", "ROME FSDD", "ROME DD IBC", "LEGION DD",
  "MAVIK FSDD", "ZION FSDD", "ENZO XLR", "ENZO XLR 3.0", "LEGION 21 Spd",
  "SYNC", "SYNC", "HAVOC FSDD", "RYNET FSDD", "HELIOS 2.0 VB", "HELIOS 2.0 DD",
  "HAVOC FSDD", "RYNET FSDD", "MAVIK 21 Spd"
];

const slugify = (text) => text.toString().toLowerCase()
  .replace(/\s+/g, '-')           // Replace spaces with -
  .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
  .replace(/\-\-+/g, '-')         // Replace multiple - with single -
  .replace(/^-+/, '')             // Trim - from start of text
  .replace(/-+$/, '');            // Trim - from end of text

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    let radiantBrand = await Brand.findOne({ slug: "radiant" });
    if (!radiantBrand) {
      radiantBrand = await Brand.create({ name: "Radiant", slug: "radiant" });
      console.log("Created Radiant brand.");
    } else {
      console.log("Radiant brand already exists.");
    }

    let defaultCategory = await Category.findOne({ slug: "uncategorized" });
    if (!defaultCategory) {
      defaultCategory = await Category.create({ name: "Uncategorized", slug: "uncategorized" });
      console.log("Created Uncategorized category.");
    } else {
      console.log("Uncategorized category already exists.");
    }

    const slugCounts = {};
    const skuCounts = {};

    // In case we run it multiple times, we need to check existing slugs in DB,
    // but a simpler way is to just generate a random short id if we hit duplicates,
    // or rely on unique indexes to fail. Let's just assume we run it once.
    // Actually, to be safe, let's query all existing products to avoid inserting duplicates completely?
    // User says "I have to add all these 76 product names... Give radiant".
    // I will just add them.

    let addedCount = 0;

    for (const name of productNames) {
      let baseSlug = slugify(name);
      if (!baseSlug) baseSlug = "product";
      
      let slug = baseSlug;
      if (slugCounts[baseSlug]) {
        slug = `${baseSlug}-${slugCounts[baseSlug]}`;
        slugCounts[baseSlug]++;
      } else {
        slugCounts[baseSlug] = 1;
      }

      let baseSku = `RAD-${baseSlug.substring(0, 10).toUpperCase()}`;
      let sku = baseSku;
      if (skuCounts[baseSku]) {
        sku = `${baseSku}-${skuCounts[baseSku]}`;
        skuCounts[baseSku]++;
      } else {
        skuCounts[baseSku] = 1;
      }

      // Check if this SKU already exists (in case script is run multiple times)
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        console.log(`Product with SKU ${sku} already exists. Skipping.`);
        continue;
      }

      const newProduct = {
        name: name,
        slug: slug,
        sku: sku,
        type: "cycle",
        brand: radiantBrand._id,
        category: defaultCategory._id,
        regularPrice: 0,
        stock: 0,
        isActive: true,
        images: [],
        videos: [],
      };

      await Product.create(newProduct);
      addedCount++;
      console.log(`Added ${name} (Slug: ${slug}, SKU: ${sku})`);
    }

    console.log(`Successfully added ${addedCount} new products.`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
}

seed();
