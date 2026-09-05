import mongoose, { Document, Schema, Model } from "mongoose";

export interface IInventoryTransaction extends Document {
  product: mongoose.Types.ObjectId;
  variant?: mongoose.Types.ObjectId;
  type: "restock" | "sale" | "return" | "adjustment" | "writeoff";
  previousQuantity: number;
  adjustment: number;
  newQuantity: number;
  reason?: string;
  reference?: string;
  performedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const InventoryTransactionSchema = new Schema<IInventoryTransaction>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variant: { type: Schema.Types.ObjectId, ref: "ProductVariant", index: true },
    type: {
      type: String,
      enum: ["restock", "sale", "return", "adjustment", "writeoff"],
      required: true,
    },
    previousQuantity: { type: Number, required: true },
    adjustment: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    reason: { type: String },
    reference: { type: String },
    performedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

InventoryTransactionSchema.index({ createdAt: -1 });

const InventoryTransaction: Model<IInventoryTransaction> =
  mongoose.models?.InventoryTransaction ??
  mongoose.model<IInventoryTransaction>("InventoryTransaction", InventoryTransactionSchema);

export default InventoryTransaction;
