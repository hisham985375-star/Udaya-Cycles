import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IAddress {
  _id?: mongoose.Types.ObjectId;
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  avatar?: string;
  addresses: IAddress[];
  isActive: boolean;
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
  fullName: string;
}

const AddressSchema = new Schema<IAddress>(
  {
    label: { type: String, default: "Home" },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    avatar: { type: String },
    addresses: [AddressSchema],
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpiry: { type: Date, select: false },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        const docRet = ret as {
          passwordHash?: string;
          emailVerificationToken?: string;
          passwordResetToken?: string;
          passwordResetExpiry?: Date;
        };
        delete docRet.passwordHash;
        delete docRet.emailVerificationToken;
        delete docRet.passwordResetToken;
        delete docRet.passwordResetExpiry;
        return docRet;
      },
    },
  }
);

// Virtual: full name
UserSchema.virtual("fullName").get(function (this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

// Method: compare password
UserSchema.methods.comparePassword = async function (
  this: IUser,
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

// Pre-save: only one default address allowed
UserSchema.pre("save", function (this: IUser, next) {
  const defaultAddresses = this.addresses.filter((a) => a.isDefault);
  if (defaultAddresses.length > 1) {
    // Keep only the last one as default
    this.addresses.forEach((a, i) => {
      if (i < this.addresses.length - 1) a.isDefault = false;
    });
  }
  next();
});

const User: Model<IUser> =
  mongoose.models?.User ?? mongoose.model<IUser>("User", UserSchema);

export default User;
