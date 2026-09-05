/**
 * Udaya Cycles - Full Catalogue Seed Script
 * Run with: node scripts/seed-catalogue.mjs
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

const BrandSchema = new mongoose.Schema(
  { name: String, slug: String, description: String, isActive: { type: Boolean, default: true }, sortOrder: { type: Number, default: 0 } },
  { timestamps: true }
);

const CategorySchema = new mongoose.Schema(
  { name: String, slug: String, description: String, image: { url: { type: String, default: "" }, publicId: { type: String, default: "" } }, isActive: { type: Boolean, default: true }, sortOrder: { type: Number, default: 0 } },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    name: String, slug: { type: String, unique: true }, sku: { type: String, unique: true },
    type: { type: String, default: "cycle" }, category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    description: String, shortDescription: String,
    images: [{ url: String, publicId: String, alt: String, sortOrder: Number, isDefault: Boolean }],
    videos: [], regularPrice: { type: Number, default: 0 }, salePrice: Number,
    stock: { type: Number, default: 50 }, lowStockThreshold: { type: Number, default: 5 },
    isActive: { type: Boolean, default: true }, isNewArrival: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false }, newArrivalOrder: { type: Number, default: 0 },
    featuredOrder: { type: Number, default: 0 }, allowBackorder: { type: Boolean, default: false },
    hideWhenOutOfStock: { type: Boolean, default: false }, hasVariants: { type: Boolean, default: false },
    variantAttributes: [], specifications: [], warranty: { duration: String, description: String },
    supplier: { name: String }, seo: { title: String, description: String, keywords: [String] },
    deletedAt: { type: Date, default: null }, averageRating: { type: Number, default: 0 }, reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Brand = mongoose.models?.Brand ?? mongoose.model("Brand", BrandSchema);
const Category = mongoose.models?.Category ?? mongoose.model("Category", CategorySchema);
const Product = mongoose.models?.Product ?? mongoose.model("Product", ProductSchema);

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function buildSpecs(size, features, notes) {
  const fields = [{ label: "Wheel Size", value: size }];
  if (features) features.forEach(f => fields.push({ label: "Feature", value: f }));
  if (notes) fields.push({ label: "Note", value: notes });
  return [{ groupName: "Specifications", fields }];
}

function buildDescription(name, size, features, variants) {
  let desc = `${name} is a quality Udaya bicycle with wheel size ${size}.`;
  if (features && features.length) desc += ` Key features include: ${features.join(", ")}.`;
  if (variants) desc += ` Available variants: ${variants}.`;
  return desc;
}

const PRODUCTS_DATA = [
  { id: "01", name: "Legion SR 12", size: "12X2.80", cat: "Kids Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Eva Tyres", "Fenders", "Backrest", "Sipper"] },
  { id: "02", name: "Legion TT 12", size: "12X2.40", cat: "Kids Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Tyre Tube", "Fenders", "Backrest", "Sipper"] },
  { id: "03", name: "Mooki 12", size: "12X2.80", cat: "Kids Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Eva Tyres", "Fenders", "Backrest & Basket", "Inner Cable"] },
  { id: "04", name: "Mooki TT 12", size: "12X2.80", cat: "Kids Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Eva Tyres", "Fenders", "Backrest & Basket", "Inner Cable"] },
  { id: "05", name: "Prime IBC 12", size: "12X2.80", cat: "Kids Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Eva Tyres", "Fenders", "Backrest & Basket", "Inner Cable"], variants: "NON-IBC" },
  { id: "06", name: "Jungle Joy IBC 14", size: "14X2.80", cat: "Kids Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Eva Tyres", "Fenders", "Backrest & Basket", "Inner Cable"], variants: "NON-IBC, TYRE & TUBE" },
  { id: "07", name: "Mooki 14", size: "14X2.80", cat: "Kids Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Eva Tyres", "Fenders", "Backrest & Basket", "Inner Cable"], variants: "TYRE & TUBE" },
  { id: "08", name: "Legion SR 14", size: "14X2.80", cat: "Kids Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Eva Tyres", "Fenders", "Backrest", "Sipper"], variants: "TYRE & TUBE" },
  { id: "09", name: "Legion IBC 14", size: "14X2.40", cat: "Kids Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Tyre Tube", "Fenders", "Backrest", "Sipper"], variants: "Eva Tyres" },
  { id: "10", name: "Madmax TT 14", size: "14X2.40", cat: "Kids Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Tyre Tube", "Fenders", "Backrest & Basket", "Inner Cable", "Knuckle Guard", "Alloy QR", "PU Saddle"], variants: "NON-IBC" },
  { id: "11", name: "Prime 16", size: "16X2.80", cat: "Kids Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Eva Tyre", "Fenders", "Backrest & Basket", "Inner Cable"], variants: "IBC" },
  { id: "12", name: "Jungle Joy IBC 16", size: "16X2.80", cat: "Kids Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Eva Tyres", "Fenders", "Backrest & Basket", "Inner Cable"], variants: "NON-IBC, TYRE & TUBE" },
  { id: "13", name: "Prime IBC 16", size: "16X2.80", cat: "Kids Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Eva Tyre", "Fenders", "Backrest & Basket", "Inner Cable"], variants: "NON-IBC" },
  { id: "14", name: "Mooki 16", size: "16X2.80", cat: "Kids Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Eva Tyres", "Fenders", "Backrest & Basket", "Inner Cable"] },
  { id: "15", name: "Legion SR 16", size: "16X2.80", cat: "Kids Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Tyre Tube", "Fenders", "Backrest", "Sipper"] },
  { id: "16", name: "Madrid TT 16", size: "16X2.40", cat: "Kids Bicycles", features: ["Steel Frame", "V-Brakes", "Bushless Chain", "Steel Rim & Tyre Tube", "Fenders", "Backrest & Basket", "Inner Cable"], variants: "IBC" },
  { id: "17", name: "Madmax TT 16", size: "16X2.40", cat: "Kids Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Backrest & Basket", "Inner Cable", "Knuckle Guard", "Alloy QR", "PU Saddle"], variants: "NON-IBC" },
  { id: "18", name: "Rome TT 16", size: "16X2.40", cat: "Kids Bicycles", features: ["Steel Frame", "V-Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Alloy QR", "PU Saddle", "Sipper"], variants: "IBC", notes: "Water Transfer Label" },
  { id: "19", name: "Enzo 2.0 16", size: "16X2.40", cat: "Kids Bicycles", features: ["Steel Frame", "V-Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Alloy QR", "PU Saddle", "Sipper"], variants: "IBC" },
  { id: "20", name: "Madrid IBC 16", size: "16X2.40", cat: "Kids Bicycles", features: ["Steel Frame", "V-Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Backrest & Basket", "Alloy QR", "PU Saddle", "Sipper"], variants: "NON-IBC" },
  { id: "21", name: "Enzo 2.0 IBC 16", size: "16X2.40", cat: "Kids Bicycles", features: ["Steel Frame", "V-Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Alloy QR", "PU Saddle", "Sipper"], variants: "IBC" },
  { id: "22", name: "Enzo 3.0 16", size: "16X3.00", cat: "Kids Bicycles", features: ["Steel Frame", "V-Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Alloy QR", "PU Saddle", "Sipper", "BB Cartridge"], variants: "IBC" },
  { id: "23", name: "Legion SR 20", size: "20X2.40", cat: "Kids Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Tyre Tube", "Fenders", "Sipper"], variants: "IBC" },
  { id: "24", name: "Jungle Joy 20", size: "20X2.40", cat: "Kids Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Backrest & Basket", "Inner Cable"], variants: "IBC" },
  { id: "25", name: "Prime IBC 20", size: "20X2.80", cat: "Kids Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Eva Tyre", "Fenders", "Backrest & Basket", "Inner Cable"], variants: "20X3.00 TYRES, IBC, TYRE TUBE" },
  { id: "26", name: "Jungle Joy IBC 20", size: "20X2.80", cat: "Kids Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Backrest & Basket", "Inner Cable", "Knuckle Guard"], variants: "NON-IBC" },
  { id: "27", name: "Legion ZX 20", size: "20X2.40", cat: "Kids Bicycles", features: ["Steel Frame", "V-Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Knuckle Guard", "Alloy QR"], variants: "IBC" },
  { id: "28", name: "Legion TT IBC 20", size: "20X2.40", cat: "Kids Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Tyre Tube", "Fenders", "Backrest", "Sipper"], variants: "NON-IBC" },
  { id: "29", name: "Rome TT 20", size: "20X2.40", cat: "Kids Bicycles", features: ["Steel Frame", "V-Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Alloy QR", "PU Saddle", "Sipper"], variants: "IBC", notes: "Water Transfer Label" },
  { id: "30", name: "Rome IBC 20", size: "20X2.40", cat: "Kids Bicycles", features: ["Steel Frame", "V-Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Alloy QR", "PU Saddle", "Sipper"], variants: "IBC", notes: "Water Transfer Label" },
  { id: "31", name: "Madmax TT 20", size: "20X2.40", cat: "Kids Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Backrest & Basket", "Inner Cable", "Knuckle Guard", "Alloy QR", "PU Saddle"], variants: "IBC" },
  { id: "32", name: "Madrid TT IBC 20", size: "20X2.40", cat: "Kids Bicycles", features: ["Steel Frame", "V-Brakes", "Bushless Chain", "Steel Rim & Tyre Tube", "Fenders", "Backrest & Basket", "Alloy QR", "PU Saddle", "Sipper"], variants: "NON-IBC" },
  { id: "33", name: "Enzo 2.0 20", size: "20X2.40", cat: "Kids Bicycles", features: ["Steel Frame", "V-Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Alloy QR", "PU Saddle", "Sipper"], variants: "IBC" },
  { id: "34", name: "Zander VB 20", size: "20X2.40", cat: "Kids Bicycles", features: ["Steel Frame", "V-Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Alloy QR", "PU Saddle", "Sipper", "Knuckle Guard"], variants: "IBC" },
  { id: "35", name: "Zander DD 20", size: "20X2.40", cat: "Kids Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Alloy QR", "PU Saddle", "Sipper", "Knuckle Guard"], variants: "IBC" },
  { id: "36", name: "Enzo 2.0 IBC 20", size: "20X2.40", cat: "Kids Bicycles", features: ["Steel Frame", "V-Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Alloy QR", "PU Saddle", "Sipper"], variants: "NON-IBC" },
  { id: "37", name: "Enzo XLR 20", size: "20X2.40", cat: "Kids Bicycles", features: ["Steel Frame", "V-Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Alloy QR", "PU Saddle", "Sipper"], variants: "IBC", notes: "Water Transfer Label" },
  { id: "38", name: "Prime 3.0 20", size: "20X3.00", cat: "Kids Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Eva Tyre", "Fenders", "Backrest & Basket", "Inner Cable", "Knuckle Guard"], variants: "NON-IBC" },
  { id: "39", name: "Enzo 3.0 IBC 20", size: "20X3.00", cat: "Kids Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Alloy QR", "PU Saddle", "Sipper"], variants: "NON-IBC" },
  { id: "40", name: "Enzo 3.0 FSDD 20", size: "20X3.00", cat: "Kids Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Alloy QR", "PU Saddle", "Sipper"], variants: "IBC", notes: "Full Suspension" },
  { id: "43", name: "Sienna 24", size: "24X2.125", cat: "Girl's Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Inner Cable", "Steel Basket", "Steel Mudguards", "PU Saddle"] },
  { id: "44", name: "Sienna 26", size: "26X2.125", cat: "Girl's Bicycles", features: ["Steel Frame", "Caliper Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Inner Cable", "Steel Basket", "Steel Mudguards", "PU Saddle"] },
  { id: "47", name: "Legion VB 24", size: "24X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "V-Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Knuckle Guard", "Alloy QR", "PU Saddle"], variants: "VB, VB IBC, D-DISC, D-DISC IBC, M.SPEED" },
  { id: "48", name: "Legion DD IBC 24", size: "24X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Knuckle Guard", "Alloy QR", "PU Saddle"], variants: "VB, VB IBC, D-DISC, D-DISC IBC, M.SPEED" },
  { id: "49", name: "Mavik VB 24", size: "24X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "V-Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Knuckle Guard", "Alloy QR", "PU Saddle"], variants: "VB, VB IBC, D-DISC, D-DISC IBC, M.SPEED", notes: "Water Transfer Label" },
  { id: "50", name: "Rome VB 24", size: "24X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "V-Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Knuckle Guard", "Alloy QR", "PU Saddle"], variants: "VB, VB IBC, D-DISC, D-DISC IBC", notes: "Water Transfer Label" },
  { id: "51", name: "Rome DD IBC 24", size: "24X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "V-Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Knuckle Guard", "Alloy QR", "PU Saddle"], variants: "VB, VB IBC, D-DISC, D-DISC IBC", notes: "Water Transfer Label" },
  { id: "52", name: "Legion DD 24", size: "24X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Knuckle Guard", "Alloy QR", "PU Saddle"], variants: "VB, VB IBC, D-DISC, D-DISC IBC, M.SPEED" },
  { id: "53", name: "Mavik FSDD 24", size: "24X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "V-Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Knuckle Guard", "Alloy QR", "PU Saddle"], variants: "VB, VB IBC, D-DISC, D-DISC IBC, M.SPEED", notes: "Water Transfer Label" },
  { id: "54", name: "Rome FSDD 24", size: "24X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Knuckle Guard", "Alloy QR", "PU Saddle"], variants: "VB, VB IBC, D-DISC, D-DISC IBC", notes: "Water Transfer Label" },
  { id: "55", name: "Rome IBC FSDD 24", size: "24X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Knuckle Guard", "Alloy QR", "PU Saddle"], variants: "VB, VB IBC, D-DISC, D-DISC IBC", notes: "Water Transfer Label" },
  { id: "56", name: "Zion FSDD 24", size: "24X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Alloy QR", "PU Saddle"] },
  { id: "57", name: "Enzo XLR 24", size: "24X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Alloy Rim & Tyre Tubes", "Fenders", "Inner Cable", "Alloy QR", "PU Saddle"], notes: "Water Transfer Label" },
  { id: "58", name: "Enzo XLR 3.0 24", size: "24X3.00", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Alloy Rim & Tyre Tubes", "Fenders", "Inner Cable", "Alloy QR", "PU Saddle"], notes: "Water Transfer Label" },
  { id: "59", name: "Sync 24", size: "24X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Alloy Rim & Tyre Tubes", "Fenders", "Threadless Fork Fitting", "Alloy QR", "PU Saddle", "BB Cartridge", "Alloy Stem"], notes: "Water Transfer Label" },
  { id: "60", name: "Sync DH 24", size: "24X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Alloy Rim & Tyre Tubes", "Fenders", "Threadless Fork Fitting", "Alloy QR", "PU Saddle", "BB Cartridge", "Alloy Stem"], notes: "New MTB DownHill Suspension Fork" },
  { id: "61", name: "Legion DD 26", size: "26X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Knuckle Guard", "Alloy QR", "PU Saddle"], variants: "VB, VB IBC, D-DISC, D-DISC IBC, M.SPEED" },
  { id: "62", name: "Legion VB IBC 26", size: "26X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "V-Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Knuckle Guard", "Alloy QR", "PU Saddle"], variants: "VB, VB IBC, D-DISC, D-DISC IBC, M.SPEED" },
  { id: "63", name: "Mavik VB IBC 26", size: "26X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "V-Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Alloy QR", "PU Saddle"], variants: "VB, VB IBC, D-DISC, D-DISC IBC, M.SPEED", notes: "Water Transfer Label" },
  { id: "64", name: "Rome FSDD 26", size: "26X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Knuckle Guard", "Alloy QR", "PU Saddle"], variants: "VB, VB IBC, D-DISC, D-DISC IBC", notes: "Water Transfer Label" },
  { id: "65", name: "Rome DD IBC 26", size: "26X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Knuckle Guard", "Alloy QR", "PU Saddle"], variants: "VB, VB IBC, D-DISC, D-DISC IBC", notes: "Water Transfer Label" },
  { id: "66", name: "Legion DD 26 Pro", size: "26X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Knuckle Guard", "Alloy QR", "PU Saddle"], variants: "VB, VB IBC, D-DISC, D-DISC IBC, M.SPEED" },
  { id: "67", name: "Mavik FSDD 26", size: "26X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Alloy QR", "PU Saddle"], variants: "VB, VB IBC, D-DISC, D-DISC IBC, M.SPEED", notes: "Water Transfer Label" },
  { id: "68", name: "Zion FSDD 26", size: "26X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Alloy QR", "PU Saddle"] },
  { id: "69", name: "Enzo XLR 26", size: "26X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Alloy Rim & Tyre Tubes", "Fenders", "Inner Cable", "Alloy QR", "PU Saddle"], notes: "Water Transfer Label" },
  { id: "70", name: "Enzo XLR 3.0 26", size: "26X3.00", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Alloy Rim & Tyre Tubes", "Fenders", "Inner Cable", "Alloy QR", "PU Saddle"], notes: "Water Transfer Label" },
  { id: "71", name: "Sync 26", size: "26X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Alloy Rim & Tyre Tubes", "Fenders", "Threadless Fork Fitting", "Alloy QR", "PU Saddle", "BB Cartridge", "Alloy Stem"], notes: "Water Transfer Label" },
  { id: "72", name: "Sync DH 26", size: "26X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Alloy Rim & Tyre Tubes", "Fenders", "Threadless Fork Fitting", "Alloy QR", "PU Saddle", "BB Cartridge", "Alloy Stem"], notes: "New MTB DownHill Suspension Fork" },
  { id: "73", name: "Havoc FSDD 26", size: "26X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Alloy Rim & Tyre Tubes", "Fenders", "Threadless Fork Fitting", "Alloy QR", "PU Saddle", "BB Cartridge", "Alloy Stem"], notes: "Water Transfer Label" },
  { id: "74", name: "Legion 21 Speed", size: "24 & 26X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Alloy QR", "PU Saddle"], variants: "VB, VB IBC, D-DISC, D-DISC IBC, M.SPEED", notes: "Shimano 21 Speed" },
  { id: "75", name: "Mavik 21 Speed", size: "24 & 26X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Steel Rim & Tyre Tubes", "Fenders", "Inner Cable", "Alloy QR", "PU Saddle"], variants: "VB, VB IBC, D-DISC, D-DISC IBC, M.SPEED", notes: "Shimano 21 Speed" },
  { id: "76", name: "Helios 2.0 VB 700C", size: "700C", cat: "MTB Bicycles", features: ["Steel Frame", "V-Brakes", "Bushless Chain", "Alloy Rim & Tyre Tubes", "Fenders", "Threadless Fork Fitting", "Alloy QR", "PU Saddle", "BB Cartridge", "Alloy Stem"], notes: "Water Transfer Label" },
  { id: "77", name: "Helios 2.0 DD 700C", size: "700C", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Alloy Rim & Tyre Tubes", "Fenders", "Threadless Fork Fitting", "Alloy QR", "PU Saddle", "BB Cartridge", "Alloy Stem"], notes: "Water Transfer Label" },
  { id: "78", name: "Rynet FSDD 27.5", size: "27.5X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Alloy Rim & Tyre Tubes", "Fenders", "Threadless Fork Fitting", "Alloy QR", "PU Saddle", "BB Cartridge", "Alloy Stem"], notes: "Water Transfer Label" },
  { id: "79", name: "Havoc FSDD 29", size: "29X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Alloy Rim & Tyre Tubes", "Fenders", "Threadless Fork Fitting", "Alloy QR", "PU Saddle", "BB Cartridge", "Alloy Stem"], notes: "Water Transfer Label" },
  { id: "80", name: "Rynet FSDD 29", size: "29X2.40", cat: "MTB Bicycles", features: ["Steel Frame", "Disc Brakes", "Bushless Chain", "Alloy Rim & Tyre Tubes", "Fenders", "Threadless Fork Fitting", "Alloy QR", "PU Saddle", "BB Cartridge", "Alloy Stem"], notes: "Water Transfer Label" },
];

async function main() {
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected!\n");

  console.log("🏷️  Upserting Udaya brand...");
  const brand = await Brand.findOneAndUpdate(
    { slug: "udaya" },
    { name: "Udaya", slug: "udaya", description: "Udaya Cycles - Quality bicycles for everyone", isActive: true },
    { upsert: true, new: true }
  );
  console.log(`   Brand ID: ${brand._id}\n`);

  const catNames = ["Kids Bicycles", "Girl's Bicycles", "MTB Bicycles"];
  const catMap = {};
  console.log("📂 Upserting categories...");
  for (let i = 0; i < catNames.length; i++) {
    const name = catNames[i];
    const slug = slugify(name);
    const cat = await Category.findOneAndUpdate(
      { slug },
      { name, slug, description: `Udaya ${name}`, isActive: true, sortOrder: i + 1 },
      { upsert: true, new: true }
    );
    catMap[name] = cat._id;
    console.log(`   ${name} -> ${cat._id}`);
  }
  console.log();

  console.log("🚲 Seeding products...");
  let created = 0;
  let skipped = 0;

  for (const p of PRODUCTS_DATA) {
    const slug = slugify(`${p.name}-${p.id}`);
    const sku = `UC-${p.id.toString().padStart(3, "0")}`;

    const existing = await Product.findOne({ slug });
    if (existing) {
      console.log(`   ⏭️  Skipped (already exists): ${p.name}`);
      skipped++;
      continue;
    }

    await Product.create({
      name: p.name, slug, sku, type: "cycle",
      category: catMap[p.cat], brand: brand._id,
      description: buildDescription(p.name, p.size, p.features, p.variants),
      shortDescription: `${p.name} - ${p.size} wheel bicycle.`,
      images: [], videos: [], regularPrice: 0, stock: 50, isActive: true,
      isNewArrival: false, isFeatured: false, hasVariants: false,
      specifications: buildSpecs(p.size, p.features, p.notes),
      warranty: { duration: "1 Year", description: "Manufacturer warranty against defects" },
      supplier: { name: "Udaya Cycles" },
      seo: { title: `${p.name} | Udaya Cycles`, description: buildDescription(p.name, p.size, p.features, p.variants), keywords: ["udaya", "bicycle", p.cat.toLowerCase(), p.size] },
    });

    console.log(`   ✅ Created: ${p.name} (SKU: ${sku})`);
    created++;
  }

  console.log(`\n🎉 Done! Created: ${created}, Skipped: ${skipped}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
