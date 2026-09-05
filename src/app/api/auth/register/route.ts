import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/models/User";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { generateSlug } from "@/lib/utils/helpers";
import { z } from "zod";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50).trim(),
  lastName: z.string().min(1, "Last name is required").max(50).trim(),
  email: z.string().email("Invalid email address").toLowerCase(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, password } = parsed.data;

    // Password strength check
    const { valid, message } = validatePasswordStrength(password);
    if (!valid) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    await connectDB();

    // Check duplicates
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      if (existing.email === email) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "An account with this phone number already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      passwordHash,
    });

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/auth/register]", error);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}

// Silence unused import lint warning
void generateSlug;
