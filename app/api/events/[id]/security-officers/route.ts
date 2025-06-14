import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Extract eventId from the URL pathname
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    // Find the index of 'events' and get the next part as the eventId
    const eventIndex = pathParts.findIndex((part) => part === "events");
    const eventId = eventIndex !== -1 ? pathParts[eventIndex + 1] : undefined;
    if (!eventId) {
      return NextResponse.json(
        { message: "Event ID not found in URL" },
        { status: 400 }
      );
    }

    // Verify the user is the organizer of this event
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId: session.user.id,
      },
    });

    if (!event) {
      return NextResponse.json(
        { message: "Event not found or access denied" },
        { status: 404 }
      );
    }

    // Get security officers for this event
    const officers = await prisma.securityOfficer.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ officers });
  } catch (error) {
    console.error("Error fetching security officers:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Extract eventId from the URL pathname
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const eventIndex = pathParts.findIndex((part) => part === "events");
    const eventId = eventIndex !== -1 ? pathParts[eventIndex + 1] : undefined;
    if (!eventId) {
      return NextResponse.json(
        { message: "Event ID not found in URL" },
        { status: 400 }
      );
    }

    const { name, email, phone } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { message: "Name and email are required" },
        { status: 400 }
      );
    }

    // Verify the user is the organizer of this event
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId: session.user.id,
      },
    });

    if (!event) {
      return NextResponse.json(
        { message: "Event not found or access denied" },
        { status: 404 }
      );
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // If user doesn't exist, create them
    if (!user) {
      const hashedPassword = await bcrypt.hash("defaultPassword123", 12);
      user = await prisma.user.create({
        data: {
          email,
          name,
          phone,
          role: "SECURITY",
          password: hashedPassword,
        },
      });
    } else {
      // Update user role to SECURITY if not already
      if (user.role !== "SECURITY") {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: "SECURITY" },
        });
      }
    }

    // Check if security officer already exists for this event
    const existingOfficer = await prisma.securityOfficer.findFirst({
      where: {
        userId: user.id,
        eventId,
      },
    });

    if (existingOfficer) {
      return NextResponse.json(
        { message: "Security officer already exists for this event" },
        { status: 409 }
      );
    }

    // Create security officer
    const officer = await prisma.securityOfficer.create({
      data: {
        name,
        email,
        phone,
        userId: user.id,
        eventId,
        active: true,
      },
      include: {
        user: {
          select: {
            id: true,
            profileImage: true,
          },
        },
      },
    });

    return NextResponse.json({ officer }, { status: 201 });
  } catch (error) {
    console.error("Error creating security officer:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
