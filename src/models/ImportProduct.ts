import mongoose, { Document, Schema, Model } from "mongoose";

export type ImportProductStatus =
  | "PROCESSING"
  | "READY"
  | "NEEDS_REVIEW"
  | "FAILED"
  | "APPROVED"
  | "REJECTED";

export interface IImportProductImage {
  originalPath?: string;      // local path of extracted/rendered image
  processedPath?: string;     // local path of background-removed PNG
  cloudinaryPublicId?: string;
  cloudinaryUrl?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  extractionMethod?: "embedded" | "rendered"; // how the image was obtained
  qualityIssues?: string[];   // e.g. ["possible_crop", "low_resolution"]
}

export interface IImportProduct extends Document {
  importJob: mongoose.Types.ObjectId;
  importFile: mongoose.Types.ObjectId;
  sourcePageNumber: number;

  // Extracted info
  extractedName?: string;
  extractedBrand?: mongoose.Types.ObjectId; // matched to existing Brand
  extractedBrandRaw?: string;               // raw text if no match
  extractedCategory?: mongoose.Types.ObjectId; // matched to existing Category
  extractedCategoryRaw?: string;
  extractedSize?: string;
  extractedSku?: string;
  extractedDescription?: string;
  extractedRegularPrice?: number; // in paise
  extractedSalePrice?: number;    // in paise
  extractedSpecifications?: { label: string; value: string }[];

  // Confidence scores (0–100)
  nameConfidence: number;
  brandConfidence: number;
  categoryConfidence: number;
  sizeConfidence: number;
  imageConfidence: number;

  // Review flags
  nameNeedsReview: boolean;
  brandNeedsReview: boolean;
  categoryNeedsReview: boolean;
  sizeNeedsReview: boolean;
  imageNeedsReview: boolean;

  // Image
  image: IImportProductImage;

  // Status
  status: ImportProductStatus;
  errorMessages: string[];
  reviewNotes?: string;

  // Set after approval
  createdProductId?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const ImportProductImageSchema = new Schema<IImportProductImage>(
  {
    originalPath: { type: String },
    processedPath: { type: String },
    cloudinaryPublicId: { type: String },
    cloudinaryUrl: { type: String },
    width: { type: Number },
    height: { type: Number },
    fileSize: { type: Number },
    extractionMethod: { type: String, enum: ["embedded", "rendered"] },
    qualityIssues: [{ type: String }],
  },
  { _id: false }
);

const ImportProductSchema = new Schema<IImportProduct>(
  {
    importJob: { type: Schema.Types.ObjectId, ref: "ImportJob", required: true, index: true },
    importFile: { type: Schema.Types.ObjectId, ref: "ImportFile", required: true, index: true },
    sourcePageNumber: { type: Number, default: 0 },

    extractedName: { type: String },
    extractedBrand: { type: Schema.Types.ObjectId, ref: "Brand" },
    extractedBrandRaw: { type: String },
    extractedCategory: { type: Schema.Types.ObjectId, ref: "Category" },
    extractedCategoryRaw: { type: String },
    extractedSize: { type: String },
    extractedSku: { type: String },
    extractedDescription: { type: String },
    extractedRegularPrice: { type: Number },
    extractedSalePrice: { type: Number },
    extractedSpecifications: [
      {
        label: { type: String },
        value: { type: String },
        _id: false,
      },
    ],

    nameConfidence: { type: Number, default: 0, min: 0, max: 100 },
    brandConfidence: { type: Number, default: 0, min: 0, max: 100 },
    categoryConfidence: { type: Number, default: 0, min: 0, max: 100 },
    sizeConfidence: { type: Number, default: 0, min: 0, max: 100 },
    imageConfidence: { type: Number, default: 0, min: 0, max: 100 },

    nameNeedsReview: { type: Boolean, default: false },
    brandNeedsReview: { type: Boolean, default: false },
    categoryNeedsReview: { type: Boolean, default: false },
    sizeNeedsReview: { type: Boolean, default: true },
    imageNeedsReview: { type: Boolean, default: false },

    image: { type: ImportProductImageSchema, default: () => ({}) },

    status: {
      type: String,
      enum: ["PROCESSING", "READY", "NEEDS_REVIEW", "FAILED", "APPROVED", "REJECTED"],
      default: "PROCESSING",
      index: true,
    },
    errorMessages: [{ type: String }],
    reviewNotes: { type: String },
    createdProductId: { type: Schema.Types.ObjectId, ref: "Product" },
  },
  { timestamps: true }
);

// Compound indexes for efficient querying
ImportProductSchema.index({ importJob: 1, status: 1 });
ImportProductSchema.index({ importJob: 1, importFile: 1 });

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.ImportProduct;
}

const ImportProduct: Model<IImportProduct> =
  mongoose.models?.ImportProduct ??
  mongoose.model<IImportProduct>("ImportProduct", ImportProductSchema);

export default ImportProduct;
