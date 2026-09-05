import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import LegalPage from "@/models/LegalPage";
import { getAdminSession } from "@/lib/auth/admin-auth";

export async function GET() {
  try {
    await connectDB();
    const pages = await LegalPage.find().lean();
    return NextResponse.json({ pages });
  } catch (error) {
    console.error("[GET_LEGAL_PAGES]", error);
    return NextResponse.json({ error: "Failed to fetch legal pages" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { key, title, content } = await request.json();
    if (!key || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const updated = await LegalPage.findOneAndUpdate(
      { key },
      { 
        title, 
        content, 
        lastUpdated: new Date(), 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updatedBy: adminSession.id as any 
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, page: updated });
  } catch (error) {
    console.error("[PUT_LEGAL_PAGE]", error);
    return NextResponse.json({ error: "Failed to update legal page" }, { status: 500 });
  }
}
