import mongoose, { Document, Schema, Model } from "mongoose";

export type ImportFileStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "SKIPPED";

export interface IImportFile extends Document {
  importJob: mongoose.Types.ObjectId;
  originalName: string;
  fileSize: number;
  storagePath: string; // local temp path
  assignedBrand?: mongoose.Types.ObjectId;
  assignedCategory?: mongoose.Types.ObjectId;
  status: ImportFileStatus;
  pageCount: number;
  productsDetected: number;
  processingProgress: number; // 0-100
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ImportFileSchema = new Schema<IImportFile>(
  {
    importJob: { type: Schema.Types.ObjectId, ref: "ImportJob", required: true, index: true },
    originalName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    storagePath: { type: String, required: true },
    assignedBrand: { type: Schema.Types.ObjectId, ref: "Brand" },
    assignedCategory: { type: Schema.Types.ObjectId, ref: "Category" },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "SKIPPED"],
      default: "PENDING",
      index: true,
    },
    pageCount: { type: Number, default: 0 },
    productsDetected: { type: Number, default: 0 },
    processingProgress: { type: Number, default: 0, min: 0, max: 100 },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.ImportFile;
}

const ImportFile: Model<IImportFile> =
  mongoose.models?.ImportFile ?? mongoose.model<IImportFile>("ImportFile", ImportFileSchema);

export default ImportFile;
