import mongoose, { Document, Schema, Model } from "mongoose";

export interface IPriceRange extends Document {
  label: string;
  minPrice: number;
  maxPrice: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PriceRangeSchema = new Schema<IPriceRange>(
  {
    label: { type: String, required: true },        // e.g., "₹10K–₹20K"
    minPrice: { type: Number, required: true, min: 0 },  // in paise
    maxPrice: { type: Number, required: true, min: 0 },  // in paise; 999999999 = no upper limit
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const PriceRange: Model<IPriceRange> =
  mongoose.models?.PriceRange ?? mongoose.model<IPriceRange>("PriceRange", PriceRangeSchema);
export default PriceRange;
