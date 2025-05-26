import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { transporter } from "@/lib/nodemailer";

export async function POST(req: Request) {
  const { email } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const resetPasswordOtp = uuidv4();
  const otpExpiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

  await prisma.user.update({
    where: { email },
    data: {
      passwordUuid: resetPasswordOtp,
      otpExpiresAt
    },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetPasswordOtp}`;

  await transporter.sendMail({
    from: `"QRGATE" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset Link",
    html: `
      <p>You requested a password reset.</p>
      <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
      <p>This link will expire in 3 minutes.</p>
    `,
  });

  return NextResponse.json({ success: true, message: "Reset link sent." });
}
