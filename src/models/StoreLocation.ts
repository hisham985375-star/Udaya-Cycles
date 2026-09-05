import mongoose, { Document, Schema, Model } from "mongoose";

export interface IStoreHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface IStoreLocation extends Document {
  name: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  coordinates: { lat: number; lng: number };
  hours: IStoreHours[];
  image: { url: string; publicId: string };
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const StoreHoursSchema = new Schema<IStoreHours>(
  {
    day: { type: String, required: true },
    open: { type: String, default: "09:00" },
    close: { type: String, default: "20:00" },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

const StoreLocationSchema = new Schema<IStoreLocation>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },
    phone: { type: String, required: true },
    whatsapp: { type: String },
    email: { type: String },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    hours: [StoreHoursSchema],
    image: { url: { type: String, default: "" }, publicId: { type: String, default: "" } },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const StoreLocation: Model<IStoreLocation> =
  mongoose.models?.StoreLocation ??
  mongoose.model<IStoreLocation>("StoreLocation", StoreLocationSchema);
export default StoreLocation;
