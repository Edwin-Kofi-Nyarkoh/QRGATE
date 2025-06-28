import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface QRCodeData {
  eventId: string;
  userId: string;
  orderId: string;
  ticketNumber: number;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qrCode, name, phone, email, eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { message: "Event ID is required" },
        { status: 400 }
      );
    }

    let ticket = null;

    // Search by QR code
    if (qrCode) {
      try {
        // Parse the QR code JSON data
        const qrData: QRCodeData = JSON.parse(qrCode);

        // Validate QR code structure
        if (
          !qrData.eventId ||
          !qrData.userId ||
          !qrData.orderId ||
          !qrData.ticketNumber
        ) {
          return NextResponse.json(
            {
              valid: false,
              message: "Invalid QR code format",
            },
            { status: 400 }
          );
        }

        // Verify the event ID matches
        if (qrData.eventId !== eventId) {
          return NextResponse.json(
            {
              valid: false,
              message: "QR code is not valid for this event",
            },
            { status: 400 }
          );
        }

        // Find ticket using the QR code data
        ticket = await prisma.ticket.findFirst({
          where: {
            eventId: qrData.eventId,
            userId: qrData.userId,
            orderId: qrData.orderId,
            // If you have a ticketNumber field, uncomment this:
            // ticketNumber: qrData.ticketNumber,
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

        // Additional validation: Check if the QR code timestamp is reasonable
        const qrTimestamp = new Date(qrData.timestamp);
        const now = new Date();
        const timeDifference = Math.abs(now.getTime() - qrTimestamp.getTime());
        const maxAge = 24 * 60 * 60 * 1000 * 365; // 1 year in milliseconds

        if (timeDifference > maxAge) {
          return NextResponse.json(
            {
              valid: false,
              message: "QR code has expired",
            },
            { status: 400 }
          );
        }
      } catch (parseError) {
        console.error("Error parsing QR code:", parseError);
        return NextResponse.json(
          {
            valid: false,
            message: "Invalid QR code format",
          },
          { status: 400 }
        );
      }
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
    // Search by email
    else if (email) {
      ticket = await prisma.ticket.findFirst({
        where: {
          eventId: eventId,
          user: {
            email: {
              equals: email,
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
        { message: "QR code, name, email, or phone number is required" },
        { status: 400 }
      );
    }

    if (!ticket) {
      console.log("Ticket not found for event:", eventId, qrCode);

      return NextResponse.json(
        {
          valid: false,
          message: "Ticket not found for this event",
        },
        { status: 404 }
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

    // Verify user has permission to access this event (for organizers)
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
