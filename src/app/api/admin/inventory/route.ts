import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import InventoryTransaction from "@/models/InventoryTransaction";
import ProductVariant from "@/models/ProductVariant";
import { z } from "zod";

const createTransactionSchema = z.object({
  product: z.string().min(1),
  variant: z.string().optional().nullable(),
  type: z.enum(["RESTOCK", "SALE", "RETURN", "DAMAGE", "ADJUSTMENT"]),
  quantity: z.number().int().min(1),
  reference: z.string().optional(),
  notes: z.string().optional(),
  performedBy: z.string().min(1), // Admin user ID
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    
    await connectDB();
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      InventoryTransaction.find()
        .populate("product", "name sku")
        .populate("variant", "sku color size")
        .populate("performedBy", "firstName lastName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      InventoryTransaction.countDocuments(),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/inventory]", error);
    return NextResponse.json({ error: "Failed to fetch inventory transactions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createTransactionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    await connectDB();
    const { product, variant, type, quantity, reference, notes, performedBy } = parsed.data;

    // Check if variant exists and update stock
    if (variant) {
      const variantDoc = await ProductVariant.findById(variant);
      if (!variantDoc) {
        return NextResponse.json({ error: "Variant not found" }, { status: 404 });
      }

      // Calculate new stock
      let newStock = variantDoc.stock;
      if (type === "RESTOCK" || type === "RETURN" || type === "ADJUSTMENT") {
        // Assume adjustment is absolute positive for now, or needs a sign in real app
        newStock += quantity;
      } else if (type === "SALE" || type === "DAMAGE") {
        newStock -= quantity;
        if (newStock < 0) newStock = 0;
      }

      await ProductVariant.findByIdAndUpdate(variant, { stock: newStock });
    }

    const transaction = await InventoryTransaction.create({
      product,
      variant,
      type,
      quantity,
      reference,
      notes,
      performedBy,
    });

    return NextResponse.json({ message: "Inventory updated", transaction }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/inventory]", error);
    return NextResponse.json({ error: "Failed to create inventory transaction" }, { status: 500 });
  }
}
