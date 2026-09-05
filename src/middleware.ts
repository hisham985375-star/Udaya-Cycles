import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Routes that require customer authentication (NextAuth session cookie)
const CUSTOMER_PROTECTED = ["/checkout", "/wishlist", "/account"];

// Routes that require admin authentication
const ADMIN_ROUTES = ["/admin"];
const ADMIN_API_ROUTES = ["/api/admin"];

async function verifyAdminJWT(token: string): Promise<boolean> {
  try {
    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret) return false;
    const key = new TextEncoder().encode(secret);
    await jwtVerify(token, key);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin API routes ──────────────────────────────────────
  if (ADMIN_API_ROUTES.some((route) => pathname.startsWith(route))) {
    // Admin login endpoint is public
    if (pathname === "/api/admin/auth/login") return NextResponse.next();

    const adminToken = request.cookies.get("admin_token")?.value;
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const valid = await verifyAdminJWT(adminToken);
    if (!valid) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // ── Admin UI routes ───────────────────────────────────────
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    // Admin login page is public
    if (pathname === "/admin/login") return NextResponse.next();

    const adminToken = request.cookies.get("admin_token")?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const valid = await verifyAdminJWT(adminToken);
    if (!valid) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // ── Customer protected routes (using NextAuth session cookie) ─────────────
  if (CUSTOMER_PROTECTED.some((route) => pathname.startsWith(route))) {
    // Check for NextAuth session token (works on edge)
    const sessionToken =
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/checkout/:path*",
    "/wishlist/:path*",
    "/account/:path*",
  ],
};
