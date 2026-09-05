/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { getAdminSession } from "@/lib/auth/admin-auth";
import CategoryMapping from "@/models/CategoryMapping";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const { keyword, categoryId, isActive } = await request.json();

    const update: any = {};
    if (keyword !== undefined) update.keyword = keyword.trim();
    if (categoryId !== undefined) update.category = categoryId;
    if (isActive !== undefined) update.isActive = isActive;

    const updated = await CategoryMapping.findByIdAndUpdate(id, { $set: update }, { new: true })
      .populate("category", "name slug")
      .lean();

    if (!updated) return NextResponse.json({ error: "Mapping not found" }, { status: 404 });
    return NextResponse.json({ success: true, mapping: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;
    await CategoryMapping.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
