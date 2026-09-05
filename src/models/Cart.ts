import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  variant?: mongoose.Types.ObjectId;
  quantity: number;
  priceAtAdd: number;       // snapshot in paise
  salePriceAtAdd?: number;  // snapshot in paise
}

export interface ICart extends Document {
  user?: mongoose.Types.ObjectId;
  sessionId?: string;
  items: ICartItem[];
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variant: { type: Schema.Types.ObjectId, ref: "ProductVariant" },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    priceAtAdd: { type: Number, required: true },
    salePriceAtAdd: { type: Number },
  },
  { _id: true }
);

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", sparse: true, index: true },
    sessionId: { type: String, sparse: true, index: true },
    items: [CartItemSchema],
    expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

const Cart: Model<ICart> =
  mongoose.models?.Cart ?? mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
