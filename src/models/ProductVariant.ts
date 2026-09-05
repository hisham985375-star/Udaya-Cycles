import mongoose, { Document, Schema, Model } from "mongoose";

export interface IProductVariant extends Document {
  product: mongoose.Types.ObjectId;
  attributes: Map<string, string>;
  sku: string;
  barcode?: string;
  regularPrice: number;
  salePrice?: number;
  stock: number;
  image?: { url: string; publicId: string; alt?: string };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    attributes: {
      type: Map,
      of: String,
      required: true,
    },
    sku: { type: String, required: true, unique: true, trim: true },
    barcode: { type: String },
    regularPrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    image: {
      url: { type: String },
      publicId: { type: String },
      alt: { type: String },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

ProductVariantSchema.index({ product: 1, sku: 1 });
ProductVariantSchema.index({ product: 1, isActive: 1 });

ProductVariantSchema.virtual("effectivePrice").get(function (this: IProductVariant) {
  return this.salePrice ?? this.regularPrice;
});

ProductVariantSchema.virtual("inStock").get(function (this: IProductVariant) {
  return this.stock > 0;
});

const ProductVariant: Model<IProductVariant> =
  mongoose.models?.ProductVariant ??
  mongoose.model<IProductVariant>("ProductVariant", ProductVariantSchema);

export default ProductVariant;
