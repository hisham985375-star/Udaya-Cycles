/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import HomepageSettings from "@/models/HomepageSettings";
import { getAdminSession } from "@/lib/auth/admin-auth";
import { z } from "zod";

const homepageSchema = z.object({
  hero: z.object({
    headline: z.string(),
    subheadline: z.string(),
    ctaText: z.string(),
    ctaUrl: z.string(),
  }).optional(),
  whyUdaya: z.object({
    heading: z.string(),
    subheading: z.string(),
    items: z.array(z.object({
      icon: z.string().optional(),
      title: z.string(),
      description: z.string()
    }))
  }).optional(),
  promoClosure: z.object({
    heading: z.string(),
    subheading: z.string(),
    primaryCtaText: z.string(),
    primaryCtaUrl: z.string(),
    secondaryCtaText: z.string(),
    secondaryCtaUrl: z.string()
  }).optional(),
  sitewide: z.object({
    freeShippingThreshold: z.number(),
    standardShippingFee: z.number(),
    freeShippingEnabled: z.boolean(),
    maintenanceMode: z.boolean()
  }).optional(),
  contact: z.object({
    phone: z.string(),
    whatsapp: z.string(),
    email: z.string(),
    address: z.string(),
    businessHours: z.string(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    youtube: z.string().optional(),
    twitter: z.string().optional()
  }).optional(),
  sections: z.array(
    z.object({
      key: z.string(),
      isVisible: z.boolean(),
      sortOrder: z.number(),
    })
  ).optional(),
});

export async function GET() {
  try {
    await connectDB();
    let settings = await HomepageSettings.findOne().lean();

    if (!settings) {
      const newSettings = await HomepageSettings.create({});
      settings = newSettings.toObject() as any;
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("[GET /api/admin/homepage]", error);
    return NextResponse.json({ error: "Failed to fetch homepage settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = homepageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    await connectDB();

    const settings = await HomepageSettings.findOneAndUpdate(
      {},
      { 
        ...parsed.data, 
        updatedBy: adminSession.id as any
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: "Homepage settings updated", settings });
  } catch (error) {
    console.error("[PUT /api/admin/homepage]", error);
    return NextResponse.json({ error: "Failed to update homepage settings" }, { status: 500 });
  }
}
