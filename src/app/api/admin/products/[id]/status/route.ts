import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Product from "@/models/Product";
import { getAdminSession } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/audit";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { isActive } = await request.json();

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    await connectDB();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    product.isActive = isActive;
    await product.save();

    await logAdminAction({
      action: "UPDATE_PRODUCT_STATUS",
      entity: "Product",
      entityId: product._id.toString(),
      after: { isActive }
    });

    return NextResponse.json({ success: true, isActive: product.isActive });
  } catch (error: any) {
    console.error("[UPDATE_PRODUCT_STATUS_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to update product status" }, { status: 500 });
  }
}
