import mongoose, { Document, Schema, Model } from "mongoose";

export interface IWhyUdayaItem {
  icon: string;
  title: string;
  description: string;
}

export interface IHomepageSettings extends Document {
  singleton: boolean;
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaUrl: string;
  };
  whyUdaya: {
    heading: string;
    subheading: string;
    items: IWhyUdayaItem[];
  };
  promoClosure: {
    heading: string;
    subheading: string;
    primaryCtaText: string;
    primaryCtaUrl: string;
    secondaryCtaText: string;
    secondaryCtaUrl: string;
  };
  sitewide: {
    freeShippingThreshold: number;
    standardShippingFee: number;
    freeShippingEnabled: boolean;
    maintenanceMode: boolean;
  };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    businessHours: string;
    instagram: string;
    facebook: string;
    youtube: string;
    twitter: string;
  };
  sections: Array<{
    key: string;
    isVisible: boolean;
    sortOrder: number;
  }>;
  updatedAt: Date;
  updatedBy?: mongoose.Types.ObjectId;
}

const HomepageSettingsSchema = new Schema<IHomepageSettings>(
  {
    singleton: { type: Boolean, default: true, unique: true },
    hero: {
      headline: { type: String, default: "Ride the Future" },
      subheadline: { type: String, default: "Premium bicycles built for performance and passion." },
      ctaText: { type: String, default: "Explore Cycles" },
      ctaUrl: { type: String, default: "/cycles/category/all" },
    },
    whyUdaya: {
      heading: { type: String, default: "Why Udaya?" },
      subheading: { type: String, default: "Premium cycles. Exceptional service." },
      items: [
        {
          icon: { type: String, default: "" },
          title: { type: String },
          description: { type: String },
          _id: false,
        },
      ],
    },
    promoClosure: {
      heading: { type: String, default: "UDAYA CYCLES" },
      subheading: { type: String, default: "Precision. Performance. Passion." },
      primaryCtaText: { type: String, default: "Shop Now" },
      primaryCtaUrl: { type: String, default: "/cycles/category/all" },
      secondaryCtaText: { type: String, default: "Find a Store" },
      secondaryCtaUrl: { type: String, default: "/store-locator" },
    },
    sitewide: {
      freeShippingThreshold: { type: Number, default: 5000000 }, // ₹50,000 in paise
      standardShippingFee: { type: Number, default: 50000 },     // ₹500 in paise
      freeShippingEnabled: { type: Boolean, default: true },
      maintenanceMode: { type: Boolean, default: false },
    },
    contact: {
      phone: { type: String, default: "[PHONE_PLACEHOLDER]" },
      whatsapp: { type: String, default: "[WHATSAPP_PLACEHOLDER]" },
      email: { type: String, default: "info@udayacycles.com" },
      address: { type: String, default: "[ADDRESS_PLACEHOLDER]" },
      businessHours: { type: String, default: "Mon–Sat: 9AM–8PM" },
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      youtube: { type: String, default: "" },
      twitter: { type: String, default: "" },
    },
    sections: {
      type: [
        {
          key: { type: String, required: true },
          isVisible: { type: Boolean, default: true },
          sortOrder: { type: Number, default: 0 },
          _id: false,
        },
      ],
      default: [
        { key: "hero", isVisible: true, sortOrder: 0 },
        { key: "new_arrivals", isVisible: true, sortOrder: 1 },
        { key: "categories", isVisible: true, sortOrder: 2 },
        { key: "brands", isVisible: true, sortOrder: 3 },
        { key: "featured", isVisible: true, sortOrder: 4 },
        { key: "why_udaya", isVisible: true, sortOrder: 5 },
        { key: "testimonials", isVisible: true, sortOrder: 6 },
        { key: "faq", isVisible: true, sortOrder: 7 },
        { key: "promo_closure", isVisible: true, sortOrder: 8 },
      ],
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

const HomepageSettings: Model<IHomepageSettings> =
  mongoose.models?.HomepageSettings ??
  mongoose.model<IHomepageSettings>("HomepageSettings", HomepageSettingsSchema);
export default HomepageSettings;
