import mongoose, { Document, Schema, Model } from "mongoose";

export type OrderStatus =
  | "payment_pending"
  | "payment_confirmed"
  | "order_confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed_delivery"
  | "returned"
  | "refunded"
  | "cancelled";

export type PaymentMethod = "razorpay" | "cod";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  variant?: mongoose.Types.ObjectId;
  productSnapshot: {
    name: string;
    sku: string;
    image: string;
    brand?: string;
    category?: string;
    attributes?: Record<string, string>;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IStatusHistory {
  status: OrderStatus;
  note?: string;
  updatedBy?: mongoose.Types.ObjectId;
  timestamp: Date;
}

export interface IOrder extends Document {
  orderNumber: string;
  user?: mongoose.Types.ObjectId;
  customerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pinCode: string;
  };
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: OrderStatus;
  statusHistory: IStatusHistory[];
  trackingNumber?: string;
  trackingUrl?: string;
  courierPartner?: string;
  estimatedDelivery?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variant: { type: Schema.Types.ObjectId, ref: "ProductVariant" },
    productSnapshot: {
      name: { type: String, required: true },
      sku: { type: String, required: true },
      image: { type: String, default: "" },
      brand: { type: String },
      category: { type: String },
      attributes: { type: Map, of: String },
    },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const StatusHistorySchema = new Schema<IStatusHistory>(
  {
    status: { type: String, required: true },
    note: { type: String },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    customerDetails: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    shippingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pinCode: { type: String, required: true },
    },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["razorpay", "cod"], required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String, select: false },
    status: {
      type: String,
      enum: [
        "payment_pending", "payment_confirmed", "order_confirmed", "processing",
        "packed", "shipped", "in_transit", "out_for_delivery", "delivered",
        "failed_delivery", "returned", "refunded", "cancelled",
      ],
      default: "payment_pending",
      index: true,
    },
    statusHistory: [StatusHistorySchema],
    trackingNumber: { type: String },
    trackingUrl: { type: String },
    courierPartner: { type: String },
    estimatedDelivery: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });

const Order: Model<IOrder> =
  mongoose.models?.Order ?? mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
