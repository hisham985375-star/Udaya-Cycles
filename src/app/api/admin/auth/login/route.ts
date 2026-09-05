import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Admin from "@/models/Admin";
import { verifyPassword } from "@/lib/auth/password";
import { signAdminToken } from "@/lib/auth/admin-auth";
import { z } from "zod";
import { cookies } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";

const loginSchema = z.object({
  username: z.string().min(1).trim().toLowerCase(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    // Basic rate limit by IP
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const limitResult = checkRateLimit(`admin-login-${ip}`, 5, 15 * 60 * 1000); // 5 attempts per 15 minutes
    if (!limitResult.success) {
      return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    const { username, password } = parsed.data;

    await connectDB();

    const admin = await Admin.findOne({ username, isActive: true }).select("+passwordHash");
    if (!admin) {
      // Generic error message prevents username enumeration
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const isValid = await verifyPassword(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    // Update last login
    await Admin.findByIdAndUpdate(admin._id, { lastLoginAt: new Date() });

    const token = signAdminToken({
      id: admin._id.toString(),
      username: admin.username,
      role: admin.role,
    });

    // Set HTTP-only secure cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 8 * 60 * 60, // 8 hours
    });

    return NextResponse.json({
      message: "Login successful.",
      admin: {
        id: admin._id.toString(),
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("[POST /api/admin/auth/login]", error);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
