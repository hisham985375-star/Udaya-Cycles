import mongoose, { Document, Schema, Model } from "mongoose";

export interface IAuditLog extends Document {
  admin: mongoose.Types.ObjectId;
  action: string;
  entity: string;
  entityId?: mongoose.Types.ObjectId;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    admin: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    action: { type: String, required: true, index: true },
    entity: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, index: true },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ entity: 1, entityId: 1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models?.AuditLog ?? mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
export default AuditLog;
