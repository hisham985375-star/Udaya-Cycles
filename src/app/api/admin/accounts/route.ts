/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Admin from "@/models/Admin";
import { getAdminSession } from "@/lib/auth/admin-auth";
import bcryptjs from "bcryptjs";

export async function GET() {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession || adminSession.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized. Superadmin only." }, { status: 401 });
    }

    await connectDB();
    const admins = await Admin.find().select("-passwordHash").lean();
    return NextResponse.json({ admins });
  } catch (error) {
    console.error("[GET_ADMINS]", error);
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession || adminSession.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized. Superadmin only." }, { status: 401 });
    }

    const { username, email, password, role } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    await connectDB();

    const existing = await Admin.findOne({ username: username.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(password, salt);

    const newAdmin = await Admin.create({
      username: username.toLowerCase(),
      email,
      passwordHash,
      role: role || "admin",
      createdBy: adminSession.id
    });

    const adminObj = newAdmin.toObject() as any;
    delete adminObj.passwordHash;

    return NextResponse.json({ success: true, admin: adminObj });
  } catch (error: any) {
    console.error("[POST_ADMIN]", error);
    return NextResponse.json({ error: error.message || "Failed to create admin" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession || adminSession.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized. Superadmin only." }, { status: 401 });
    }

    const { _id, isActive, role } = await request.json();
    if (!_id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    // Prevent superadmin from deactivating themselves
    if (_id === adminSession.id && isActive === false) {
      return NextResponse.json({ error: "Cannot deactivate yourself" }, { status: 400 });
    }

    await connectDB();
    const updated = await Admin.findByIdAndUpdate(
      _id,
      { isActive, role },
      { new: true }
    ).select("-passwordHash").lean();

    return NextResponse.json({ success: true, admin: updated });
  } catch (error) {
    console.error("[PUT_ADMIN]", error);
    return NextResponse.json({ error: "Failed to update admin" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession || adminSession.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized. Superadmin only." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    if (id === adminSession.id) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });

    await connectDB();
    await Admin.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE_ADMIN]", error);
    return NextResponse.json({ error: "Failed to delete admin" }, { status: 500 });
  }
}
