import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import StoreLocation from "@/models/StoreLocation";
import { getAdminSession } from "@/lib/auth/admin-auth";

export async function GET() {
  try {
    await connectDB();
    const stores = await StoreLocation.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
    return NextResponse.json({ stores });
  } catch (error) {
    console.error("[GET_STORES]", error);
    return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { stores } = await request.json();
    if (!Array.isArray(stores)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    await connectDB();

    const incomingIds = stores.filter(s => s._id).map(s => s._id);
    await StoreLocation.deleteMany({ _id: { $nin: incomingIds } });

    for (let i = 0; i < stores.length; i++) {
      const s = stores[i];
      const payload = {
        name: s.name,
        address: s.address,
        city: s.city,
        state: s.state,
        pinCode: s.pinCode,
        phone: s.phone,
        whatsapp: s.whatsapp,
        email: s.email,
        coordinates: s.coordinates || { lat: 0, lng: 0 },
        hours: s.hours || [],
        image: s.image || { url: "", publicId: "" },
        isActive: s.isActive ?? true,
        sortOrder: i
      };

      if (s._id) {
        await StoreLocation.findByIdAndUpdate(s._id, payload);
      } else {
        await StoreLocation.create(payload);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PUT_STORES]", error);
    return NextResponse.json({ error: "Failed to update stores" }, { status: 500 });
  }
}
