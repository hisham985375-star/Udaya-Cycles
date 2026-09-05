import jwt from "jsonwebtoken";
import type { IAdmin } from "@/models/Admin";
import { cookies } from "next/headers";

const ADMIN_JWT_EXPIRY = (process.env.ADMIN_JWT_EXPIRY ?? "8h") as jwt.SignOptions["expiresIn"];

const getSecret = () => {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error("ADMIN_JWT_SECRET is not defined in environment variables.");
  return secret;
};

export interface AdminTokenPayload {
  id: string;
  username: string;
  role: IAdmin["role"];
  iat?: number;
  exp?: number;
}

export function signAdminToken(payload: Omit<AdminTokenPayload, "iat" | "exp">): string {
  return jwt.sign(payload, getSecret(), { expiresIn: ADMIN_JWT_EXPIRY });
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  return jwt.verify(token, getSecret()) as AdminTokenPayload;
}

export function decodeAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.decode(token) as AdminTokenPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminTokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return null;
    return verifyAdminToken(token);
  } catch {
    return null;
  }
}
