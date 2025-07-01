import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { hash } from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const page = Number.parseInt(searchParams.get("page") || "1");

    // Check if the user is an organizer or admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "ORGANIZER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If eventId is provided, check if the user is the organizer of the event
    if (eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      if (user.role !== "ADMIN" && event.organizerId !== session.user.id) {
        return NextResponse.json(
          {
            error:
              "You are not authorized to view security officers for this event",
          },
          { status: 403 }
        );
      }
    }

    const where = {
      ...(eventId && { eventId }),
      ...(user.role === "ORGANIZER" && {
        event: {
          organizerId: session.user.id,
        },
      }),
    };

    const officers = await prisma.securityOfficer.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    const total = await prisma.securityOfficer.count({ where });

    return NextResponse.json({
      officers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching security officers:", error);
    return NextResponse.json(
      { error: "Failed to fetch security officers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, eventId } = body;

    // Check if the user is an organizer or admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "ORGANIZER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if the event exists and the user is the organizer
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && event.organizerId !== session.user.id) {
      return NextResponse.json(
        {
          error:
            "You are not authorized to add security officers to this event",
        },
        { status: 403 }
      );
    }

    // Check if a user with the provided email already exists
    let securityUser = await prisma.user.findUnique({
      where: { email },
    });

    // If user doesn't exist, create a new one with SECURITY role
    if (!securityUser) {
      // Generate a random password
      const randomPassword = Math.random().toString(36).slice(-8);

      securityUser = await prisma.user.create({
        data: {
          email,
          name,
          phone,
          role: "SECURITY",
          password: await hash(randomPassword, 10),
        },
      });

      // TODO: Send email with credentials to the security officer
    }

    // Create the security officer record
    const securityOfficer = await prisma.securityOfficer.create({
      data: {
        name,
        email,
        phone,
        eventId,
        userId: securityUser.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    return NextResponse.json(securityOfficer, { status: 201 });
  } catch (error) {
    console.error("Error creating security officer:", error);
    return NextResponse.json(
      { error: "Failed to create security officer" },
      { status: 500 }
    );
  }
}
