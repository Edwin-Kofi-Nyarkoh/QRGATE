import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qrCode, name, phone, eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { message: "Event ID is required" },
        { status: 400 }
      );
    }

    let ticket = null;

    // Search by QR code
    if (qrCode) {
      ticket = await prisma.ticket.findFirst({
        where: {
          qrCode: qrCode,
          eventId: eventId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              profileImage: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              location: true,
              organizerId: true,
            },
          },
          order: {
            select: {
              id: true,
              createdAt: true,
            },
          },
          ticketType: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      });
    }
    // Search by name
    else if (name) {
      ticket = await prisma.ticket.findFirst({
        where: {
          eventId: eventId,
          user: {
            name: {
              contains: name,
              mode: "insensitive",
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              profileImage: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              location: true,
              organizerId: true,
            },
          },
          order: {
            select: {
              id: true,
              createdAt: true,
            },
          },
          ticketType: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      });
    }
    // Search by phone
    else if (phone) {
      ticket = await prisma.ticket.findFirst({
        where: {
          eventId: eventId,
          user: {
            phone: {
              contains: phone,
              mode: "insensitive",
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              profileImage: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              location: true,
              organizerId: true,
            },
          },
          order: {
            select: {
              id: true,
              createdAt: true,
            },
          },
          ticketType: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      });
    } else {
      return NextResponse.json(
        { message: "QR code, name, or phone number is required" },
        { status: 400 }
      );
    }

    if (!ticket) {
      return NextResponse.json(
        {
          valid: false,
          message: "Ticket not found",
        },
        { status: 404, statusText: "Ticket not found" }
      );
    }

    // Check if ticket is already used
    if (ticket.isUsed) {
      return NextResponse.json(
        {
          valid: false,
          message: "This ticket has already been used",
          ticket: ticket,
          usedAt: ticket.usedAt,
        },
        { status: 409 }
      );
    }

    // Verify user has permission to access this event
    const isOrganizer = ticket.event.organizerId;

    if (!isOrganizer) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: "Valid ticket found",
      ticket: ticket,
    });
  } catch (error) {
    console.error("Error verifying ticket:", error);
    return NextResponse.json(
      {
        valid: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
