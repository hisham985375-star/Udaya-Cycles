import mongoose, { Document, Schema, Model } from "mongoose";

export interface INotification extends Document {
  type: "email" | "sms" | "whatsapp";
  event: string;
  recipient: string;
  order?: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  status: "pending" | "sent" | "failed";
  payload?: Record<string, unknown>;
  error?: string;
  sentAt?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    type: { type: String, enum: ["email", "sms", "whatsapp"], required: true },
    event: { type: String, required: true },
    recipient: { type: String, required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", index: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["pending", "sent", "failed"], default: "pending", index: true },
    payload: { type: Schema.Types.Mixed },
    error: { type: String },
    sentAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models?.Notification ??
  mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;
