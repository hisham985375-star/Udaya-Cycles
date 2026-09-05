import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail/mailer";
import { getContactFormEmail } from "@/lib/mail/templates";

export async function POST(request: Request) {
  try {
    const { name, email, phone, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    // Send email to the store admin
    const adminEmail = process.env.SMTP_FROM_EMAIL; // Or a dedicated contact email from env
    if (adminEmail) {
      const emailSent = await sendEmail({
        to: adminEmail,
        subject: `New Contact Form Submission from ${name}`,
        html: getContactFormEmail(name, email, phone, message),
      });

      if (!emailSent) {
         return NextResponse.json({ error: "Failed to send email. Please try again later." }, { status: 500 });
      }
    } else {
       console.warn("No admin email configured for contact form submissions.");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[CONTACT_API_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
