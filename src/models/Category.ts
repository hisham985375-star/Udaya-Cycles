import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image: {
    url: string;
    publicId: string;
  };
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String },
    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
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

const Category: Model<ICategory> =
  mongoose.models?.Category ?? mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
