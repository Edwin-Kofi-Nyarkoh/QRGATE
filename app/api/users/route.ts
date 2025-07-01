import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { transporter } from "@/lib/email/nodemailer";
import { registrationConfirmationEmail } from "@/lib/email/email-templates";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, phone, password } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password if provided
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isOrganizer: true,
        createdAt: true,
      },
    });

    // Send welcome email (optional)
    await transporter.sendMail({
      from: `"QRGATE" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to QRGATE!",
      html: registrationConfirmationEmail({ name }),
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
