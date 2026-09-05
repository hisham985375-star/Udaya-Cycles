import mongoose, { Document, Schema, Model } from "mongoose";

export type ImportJobStatus =
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "COMPLETED_WITH_ERRORS"
  | "FAILED"
  | "CANCELLED";

export interface IImportJob extends Document {
  jobNumber: string; // e.g. "2026-001"
  status: ImportJobStatus;
  createdBy: mongoose.Types.ObjectId;
  startedAt?: Date;
  completedAt?: Date;
  totalFiles: number;
  processedFiles: number;
  totalProducts: number;
  readyProducts: number;
  needsReviewProducts: number;
  failedProducts: number;
  approvedProducts: number;
  rejectedProducts: number;
  settings: {
    extractImages: boolean;
    attemptBackgroundRemoval: boolean;
    convertToPng: boolean;
    uploadToCloudinary: boolean;
    defaultProductType: "cycle" | "accessory";
  };
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ImportJobSchema = new Schema<IImportJob>(
  {
    jobNumber: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["QUEUED", "PROCESSING", "COMPLETED", "COMPLETED_WITH_ERRORS", "FAILED", "CANCELLED"],
      default: "QUEUED",
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    startedAt: { type: Date },
    completedAt: { type: Date },
    totalFiles: { type: Number, default: 0 },
    processedFiles: { type: Number, default: 0 },
    totalProducts: { type: Number, default: 0 },
    readyProducts: { type: Number, default: 0 },
    needsReviewProducts: { type: Number, default: 0 },
    failedProducts: { type: Number, default: 0 },
    approvedProducts: { type: Number, default: 0 },
    rejectedProducts: { type: Number, default: 0 },
    settings: {
      extractImages: { type: Boolean, default: true },
      attemptBackgroundRemoval: { type: Boolean, default: true },
      convertToPng: { type: Boolean, default: true },
      uploadToCloudinary: { type: Boolean, default: true },
      defaultProductType: { type: String, enum: ["cycle", "accessory"], default: "cycle" },
    },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.ImportJob;
}

const ImportJob: Model<IImportJob> =
  mongoose.models?.ImportJob ?? mongoose.model<IImportJob>("ImportJob", ImportJobSchema);

export default ImportJob;
