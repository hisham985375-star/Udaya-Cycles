import mongoose, { Document, Schema, Model } from "mongoose";

export interface IFAQ extends Document {
  question: string;
  answer: string;
  category?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FAQSchema = new Schema<IFAQ>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
    category: { type: String },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const FAQ: Model<IFAQ> = mongoose.models?.FAQ ?? mongoose.model<IFAQ>("FAQ", FAQSchema);
export default FAQ;
