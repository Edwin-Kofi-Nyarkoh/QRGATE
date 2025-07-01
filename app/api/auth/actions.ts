"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { User } from "@/lib/types/api";

export const getCurrentUser = async (): Promise<User | null> => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  return user as User | null;
};
