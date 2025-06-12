import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import otpGenerator from "otp-generator";
import { transporter } from "@/lib/nodemailer";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // 1. Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing)
    return NextResponse.json({ error: "User already exists" }, { status: 400 });

  // 2. Generate hashed password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Generate OTP
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const otpExpiresAt = new Date(Date.now() + 3 * 60 * 1000); // 10 minutes from now

  // 4. Create user with OTP
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      otp,
      otpExpiresAt,
    },
  });

  // 6. Send OTP email
  await transporter.sendMail({
    from: `"QRGATE" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your verification code",
    text: `Welcome to QRGATE! Your OTP code is <b>${otp}</b> . It expires in 3 minutes.`,
  });

  return NextResponse.json({
    success: true,
    message: "OTP sent to your email",
  });
}
