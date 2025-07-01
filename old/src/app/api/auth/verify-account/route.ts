import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, otp } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.otp !== otp || !user.otpExpiresAt) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  const isExpired = new Date() > user.otpExpiresAt;
  if (isExpired) {
    return NextResponse.json({ error: "Code expired" }, { status: 400 });
  }

  await prisma.user.update({
    where: { email },
    data: {
      verified: true,
      otp: null,
      otpExpiresAt: null,
    },
  });

  return NextResponse.json({ success: true, message: "Email verified" });
}
