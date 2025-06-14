import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { transporter } from "@/lib/nodemailer";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");

    // Expiration: 3 minutes from now
    const expires = new Date(Date.now() + 3 * 60 * 1000);

    // Upsert reset token
    await prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: { token, expires },
      create: {
        userId: user.id,
        token,
        expires,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

    // Send email
    await transporter.sendMail({
      from: `"QRGATE" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <p>Click the button below to reset your password:</p>
        <p><a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>This link will expire in 3 minutes.</p>
      `,
    });

    return NextResponse.json({ message: "Reset link sent" });
  } catch (error) {
    console.error("Resend Reset Link Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
