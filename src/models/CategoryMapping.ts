import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICategoryMapping extends Document {
  keyword: string;        // e.g. "MTB", "Mountain Bike", "Electric"
  category: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategoryMappingSchema = new Schema<ICategoryMapping>(
  {
    keyword: { type: String, required: true, trim: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.CategoryMapping;
}

const CategoryMapping: Model<ICategoryMapping> =
  mongoose.models?.CategoryMapping ??
  mongoose.model<ICategoryMapping>("CategoryMapping", CategoryMappingSchema);

export default CategoryMapping;
