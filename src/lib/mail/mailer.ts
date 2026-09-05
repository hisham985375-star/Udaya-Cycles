import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.SMTP_HOST) {
    console.warn("SMTP_HOST is not configured. Skipping email send.");
    return false;
  }
  
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "Udaya Cycles"}" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`[MAILER] Message sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("[MAILER] Error sending email:", error);
    return false;
  }
}
