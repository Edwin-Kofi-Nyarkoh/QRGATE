import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { passwordResetSuccessEmail } from "@/lib/email/auth-emails";
import { transporter } from "@/lib/email/nodemailer";

export async function POST(req: Request) {
  const { token, newPassword } = await req.json();

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gte: new Date() },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  // Send password reset success email
  await transporter.sendMail({
    from: `"QRGATE" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Your QRGATE Password Was Reset",
    html: passwordResetSuccessEmail(),
  });

  return NextResponse.json({ message: "Password updated" });
}
