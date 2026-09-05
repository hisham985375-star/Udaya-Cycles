import mongoose, { Document, Schema, Model } from "mongoose";

export interface ITestimonial extends Document {
  customerName: string;
  customerPhoto: { url: string; publicId: string };
  rating: number;
  reviewText: string;
  purchasedProduct?: string;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    customerName: { type: String, required: true, trim: true },
    customerPhoto: { url: { type: String, default: "" }, publicId: { type: String, default: "" } },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, required: true },
    purchasedProduct: { type: String },
    isFeatured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Testimonial: Model<ITestimonial> =
  mongoose.models?.Testimonial ?? mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);
export default Testimonial;
