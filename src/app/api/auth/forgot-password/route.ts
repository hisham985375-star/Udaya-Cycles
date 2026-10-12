import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";
import crypto from "crypto";
import { sendEmail } from "@/lib/mail/mailer";
import { getPasswordResetEmail } from "@/lib/mail/templates";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
      // Don't leak that the user doesn't exist, just return success
      return NextResponse.json({ success: true });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    
    // Set expiry to 1 hour from now
    const passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000);

    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpiry = passwordResetExpiry;
    await user.save();

    // Create reset URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    // Send email
    await sendEmail({
      to: user.email,
      subject: "Reset your Udaya Cycles password",
      html: getPasswordResetEmail(resetUrl),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FORGOT_PASSWORD_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
