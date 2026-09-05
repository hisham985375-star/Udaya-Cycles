/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { getAdminSession } from "@/lib/auth/admin-auth";
import CategoryMapping from "@/models/CategoryMapping";

// GET /api/admin/category-mappings
export async function GET(_request: Request) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const mappings = await CategoryMapping.find()
      .populate("category", "name slug")
      .sort({ keyword: 1 })
      .lean();

    return NextResponse.json({ mappings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/category-mappings
export async function POST(request: Request) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { keyword, categoryId, isActive } = await request.json();

    if (!keyword || !categoryId) {
      return NextResponse.json({ error: "keyword and categoryId are required" }, { status: 400 });
    }

    const mapping = await CategoryMapping.create({
      keyword: keyword.trim(),
      category: categoryId,
      isActive: isActive !== false,
    });

    const populated = await mapping.populate("category", "name slug");
    return NextResponse.json({ success: true, mapping: populated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
