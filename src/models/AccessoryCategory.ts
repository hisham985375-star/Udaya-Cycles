import mongoose, { Document, Schema, Model } from "mongoose";

export interface IAccessoryCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image: { url: string; publicId: string };
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const AccessoryCategorySchema = new Schema<IAccessoryCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String },
    image: { url: { type: String, default: "" }, publicId: { type: String, default: "" } },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const AccessoryCategory: Model<IAccessoryCategory> =
  mongoose.models?.AccessoryCategory ??
  mongoose.model<IAccessoryCategory>("AccessoryCategory", AccessoryCategorySchema);
export default AccessoryCategory;
