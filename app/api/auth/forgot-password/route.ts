import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transporter } from "@/lib/email/nodemailer";
import crypto from "crypto";
import { forgotPasswordEmail } from "@/lib/email/auth-emails";

export async function POST(req: Request) {
  const { email } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ error: "Email not found" }, { status: 404 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 3 * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: { resetToken: token, resetTokenExpiry: expiry },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"QRGATE" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your password",
    html: forgotPasswordEmail({ resetUrl }),
  });

  return NextResponse.json({ message: "Reset email sent" });
}
