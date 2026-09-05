import mongoose, { Document, Schema, Model } from "mongoose";

export interface IBrand extends Document {
  name: string;
  slug: string;
  description?: string;
  logo: { url: string; publicId: string };
  coverImage: { url: string; publicId: string };
  seo: { title?: string; description?: string; keywords?: string[] };
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String },
    logo: { url: { type: String, default: "" }, publicId: { type: String, default: "" } },
    coverImage: { url: { type: String, default: "" }, publicId: { type: String, default: "" } },
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: [{ type: String }],
    },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Brand: Model<IBrand> =
  mongoose.models?.Brand ?? mongoose.model<IBrand>("Brand", BrandSchema);

export default Brand;
