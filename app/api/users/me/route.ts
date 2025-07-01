import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        gender: true,
        birthday: true,
        role: true,
        isOrganizer: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            tickets: true,
            events: true,
            orders: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, address, gender, birthday, profileImage } = body;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
        address,
        gender,
        birthday: birthday ? new Date(birthday) : null,
        profileImage,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        gender: true,
        birthday: true,
        role: true,
        isOrganizer: true,
        profileImage: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
