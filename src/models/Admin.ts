import mongoose, { Document, Schema, Model } from "mongoose";

export type AdminRole = "superadmin" | "admin";

export interface IAdmin extends Document {
  username: string;
  email?: string;
  passwordHash: string;
  role: AdminRole;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: { type: String, trim: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["superadmin", "admin"],
      default: "admin",
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const docRet = ret as { passwordHash?: string };
        delete docRet.passwordHash;
        return docRet;
      },
    },
  }
);

const Admin: Model<IAdmin> =
  mongoose.models?.Admin ?? mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;
