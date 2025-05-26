import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  const { token, newPassword } = await req.json();

  if (!token || !newPassword) {
    return NextResponse.json({ message: 'Missing token or password.' }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: {
      passwordUuid: token,
      otpExpiresAt: {
        gte: new Date(Date.now() - 3 * 60 * 1000), // within the last 3 minutes
      },
    },
  });

  if (!user) {
    return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      passwordUuid: null,
      otpExpiresAt: null,
    },
  });

  return NextResponse.json({ message: 'Password reset successful.' });
}
