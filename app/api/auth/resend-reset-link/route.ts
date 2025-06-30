import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { transporter } from "@/lib/email/nodemailer";
import crypto from "crypto";
import { resendResetLinkEmail } from "@/lib/email/auth-emails";

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

    // Expiration: 15 minutes from now
    const expires = new Date(Date.now() + 15 * 60 * 1000);

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
      html: resendResetLinkEmail({ resetUrl: resetLink }),
    });

    return NextResponse.json({ message: "Reset link sent" });
  } catch (error) {
    console.error("Resend Reset Link Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
