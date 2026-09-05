import mongoose, { Document, Schema, Model } from "mongoose";

export type LegalPageKey = "privacy-policy" | "terms" | "shipping-policy" | "refund-policy";

export interface ILegalPage extends Document {
  key: LegalPageKey;
  title: string;
  content: string;
  lastUpdated: Date;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LegalPageSchema = new Schema<ILegalPage>(
  {
    key: {
      type: String,
      enum: ["privacy-policy", "terms", "shipping-policy", "refund-policy"],
      required: true,
      unique: true,
      index: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

const LegalPage: Model<ILegalPage> =
  mongoose.models?.LegalPage ?? mongoose.model<ILegalPage>("LegalPage", LegalPageSchema);
export default LegalPage;
