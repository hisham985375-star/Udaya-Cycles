import { connectDB } from "@/lib/db/mongoose";
import AuditLog from "@/models/AuditLog";
import { getAdminSession } from "@/lib/auth/admin-auth";
import { headers } from "next/headers";

export async function logAdminAction(params: {
  action: string;
  entity: string;
  entityId?: string;
  before?: any;
  after?: any;
}) {
  try {
    await connectDB();
    const session = await getAdminSession();
    if (!session?.id) return;

    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || undefined;
    const userAgent = headersList.get("user-agent") || undefined;

    await AuditLog.create({
      admin: session.id,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      before: params.before,
      after: params.after,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error("[AUDIT_LOG_ERROR]", error);
  }
}
