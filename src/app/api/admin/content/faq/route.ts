import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import FAQ from "@/models/FAQ";
import { getAdminSession } from "@/lib/auth/admin-auth";

export async function GET() {
  try {
    await connectDB();
    const faqs = await FAQ.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
    return NextResponse.json({ faqs });
  } catch (error) {
    console.error("[GET_FAQS]", error);
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { faqs } = await request.json();
    if (!Array.isArray(faqs)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    await connectDB();

    // To handle a full sync:
    // 1. Get all incoming IDs (that exist)
    const incomingIds = faqs.filter(f => f._id).map(f => f._id);
    
    // 2. Delete all FAQs not in incomingIds
    await FAQ.deleteMany({ _id: { $nin: incomingIds } });

    // 3. Update existing and insert new
    for (let i = 0; i < faqs.length; i++) {
      const f = faqs[i];
      if (f._id) {
        await FAQ.findByIdAndUpdate(f._id, {
          question: f.question,
          answer: f.answer,
          category: f.category,
          sortOrder: i, // Force sort order based on array index
          isActive: f.isActive ?? true
        });
      } else {
        await FAQ.create({
          question: f.question,
          answer: f.answer,
          category: f.category,
          sortOrder: i,
          isActive: f.isActive ?? true
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PUT_FAQS]", error);
    return NextResponse.json({ error: "Failed to update FAQs" }, { status: 500 });
  }
}
