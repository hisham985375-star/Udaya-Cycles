import mongoose, { Document, Schema, Model } from "mongoose";

export interface INewsletterSubscriber extends Document {
  email: string;
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  unsubscribeToken?: string;
}

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    isActive: { type: Boolean, default: true },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: { type: Date },
    unsubscribeToken: { type: String, select: false },
  },
  { timestamps: false }
);

const NewsletterSubscriber: Model<INewsletterSubscriber> =
  mongoose.models?.NewsletterSubscriber ??
  mongoose.model<INewsletterSubscriber>("NewsletterSubscriber", NewsletterSubscriberSchema);
export default NewsletterSubscriber;
