import mongoose, { Document, Schema, Model } from "mongoose";
import "./Category";
import "./AccessoryCategory";
import "./Brand";
import "./Admin";

export interface IProductImage {
  url: string;
  publicId: string;
  alt?: string;
  sortOrder: number;
  isDefault: boolean;
}

export interface IProductVideo {
  url: string;
  publicId: string;
  thumbnail?: string;
}

export interface IVariantAttribute {
  name: string;   // e.g., "Color"
  values: string[]; // e.g., ["Black", "White", "Neon"]
}

export interface ISpecField {
  label: string;
  value: string;
}

export interface ISpecGroup {
  groupName: string;
  fields: ISpecField[];
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  type: "cycle" | "accessory";
  category?: mongoose.Types.ObjectId;
  accessoryCategory?: mongoose.Types.ObjectId;
  brand?: mongoose.Types.ObjectId;
  description?: string;
  shortDescription?: string;
  images: IProductImage[];
  videos: IProductVideo[];
  size?: string;
  regularPrice: number;   // in paise
  salePrice?: number;     // in paise
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  isNewArrival: boolean;
  isFeatured: boolean;
  newArrivalOrder: number;
  featuredOrder: number;
  allowBackorder: boolean;
  hideWhenOutOfStock: boolean;
  hasVariants: boolean;
  variantAttributes: IVariantAttribute[];
  specifications: ISpecGroup[];
  warranty: { duration?: string; description?: string };
  supplier: {
    name?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    costPrice?: number;
  };
  seo: { title?: string; description?: string; keywords?: string[]; canonicalUrl?: string };
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProductVideoSchema = new Schema<IProductVideo>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    thumbnail: { type: String },
  },
  { _id: false }
);

const SpecFieldSchema = new Schema<ISpecField>(
  { label: { type: String, required: true }, value: { type: String, required: true } },
  { _id: false }
);

const SpecGroupSchema = new Schema<ISpecGroup>(
  {
    groupName: { type: String, required: true },
    fields: [SpecFieldSchema],
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    sku: { type: String, required: true, unique: true, trim: true },
    barcode: { type: String },
    type: { type: String, enum: ["cycle", "accessory"], default: "cycle", index: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", index: true },
    accessoryCategory: { type: Schema.Types.ObjectId, ref: "AccessoryCategory", index: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", index: true },
    description: { type: String },
    shortDescription: { type: String },
    images: [ProductImageSchema],
    videos: [ProductVideoSchema],
    size: { type: String },
    regularPrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    isActive: { type: Boolean, default: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    newArrivalOrder: { type: Number, default: 0 },
    featuredOrder: { type: Number, default: 0 },
    allowBackorder: { type: Boolean, default: false },
    hideWhenOutOfStock: { type: Boolean, default: false },
    hasVariants: { type: Boolean, default: false },
    variantAttributes: [
      {
        name: { type: String, required: true },
        values: [{ type: String }],
        _id: false,
      },
    ],
    specifications: [SpecGroupSchema],
    warranty: {
      duration: { type: String },
      description: { type: String },
    },
    supplier: {
      name: { type: String },
      contactPerson: { type: String },
      phone: { type: String },
      email: { type: String },
      costPrice: { type: Number, min: 0 },
    },
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: [{ type: String }],
      canonicalUrl: { type: String },
    },
    deletedAt: { type: Date, default: null, index: true },
    deletedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Compound indexes
ProductSchema.index({ isActive: 1, isNewArrival: 1 });
ProductSchema.index({ isActive: 1, isFeatured: 1 });
ProductSchema.index({ isActive: 1, type: 1 });
ProductSchema.index({ name: "text", description: "text", shortDescription: "text" });

// Virtual: effective price
ProductSchema.virtual("effectivePrice").get(function (this: IProduct) {
  return this.salePrice ?? this.regularPrice;
});

// Virtual: inStock
ProductSchema.virtual("inStock").get(function (this: IProduct) {
  return this.stock > 0 || this.allowBackorder;
});

// Soft delete scope: default query excludes deleted
ProductSchema.pre(/^find/, function (this: mongoose.Query<unknown, unknown>) {
  if (!(this.getOptions() as Record<string, boolean>)["includeDeleted"]) {
    this.where({ deletedAt: null });
  }
});

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.Product;
}

const Product: Model<IProduct> =
  mongoose.models?.Product ?? mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
