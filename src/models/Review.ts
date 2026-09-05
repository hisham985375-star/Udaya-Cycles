import mongoose, { Document, Schema, Model } from "mongoose";

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  body: string;
  verifiedPurchase: boolean;
  status: "pending" | "approved" | "hidden" | "deleted";
  isFeatured: boolean;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    body: { type: String, required: true, trim: true },
    verifiedPurchase: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "hidden", "deleted"],
      default: "pending",
    },
    isFeatured: { type: Boolean, default: false },
    adminNote: { type: String, select: false },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, status: 1 });
ReviewSchema.index({ user: 1, product: 1 }, { unique: true }); // one review per user per product

const Review: Model<IReview> =
  mongoose.models?.Review ?? mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
