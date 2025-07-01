import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { transporter } from "@/lib/email/nodemailer";
import { ticketScanNotificationEmail } from "@/lib/email/email-templates";

interface QRCodeData {
  eventId: string;
  userId: string;
  orderId: string;
  ticketNumber: number;
  timestamp: number;
}

// Max scans per ticket (optional, can be set based on event duration)
const MAX_SCANS_PER_TICKET = 100; // or set dynamically per event

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qrCode, name, phone, email, eventId, securityId } = body;

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

    // (Insert after finding ticket)
    if (!ticket) {
      return NextResponse.json(
        {
          valid: false,
          message: "Ticket not found for this event",
        },
        { status: 404 }
      );
    }

    // Fetch event start/end
    const event = await prisma.event.findUnique({
      where: { id: ticket.eventId },
      select: { startDate: true, endDate: true },
    });
    if (!event) {
      return NextResponse.json(
        { valid: false, message: "Event not found" },
        { status: 404 }
      );
    }
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (now < start) {
      return NextResponse.json(
        {
          valid: false,
          message: `Ticket scanning is not allowed before the event starts. Event starts at ${start.toLocaleString()}`,
        },
        { status: 403 }
      );
    }
    if (now > end) {
      return NextResponse.json(
        {
          valid: false,
          message: `Ticket scanning is not allowed after the event ends. Event ended at ${end.toLocaleString()}`,
        },
        { status: 403 }
      );
    }

    // Count previous scans for this ticket during the event
    const scanCount = await prisma.verificationLog.count({
      where: {
        ticketId: ticket.id,
        eventId: ticket.eventId,
        timestamp: {
          gte: start,
          lte: end,
        },
        action: "SCANNED",
      },
    });
    if (scanCount >= MAX_SCANS_PER_TICKET) {
      return NextResponse.json(
        {
          valid: false,
          message: `This ticket has reached the maximum number of allowed scans for this event.`,
        },
        { status: 429 }
      );
    }

    // Log the scan
    await prisma.verificationLog.create({
      data: {
        ticketId: ticket.id,
        eventId: ticket.eventId,
        securityOfficerId: securityId || "SYSTEM", // Always provide a string
        action: "SCANNED",
        details: "Ticket scanned for entry/exit",
        timestamp: now,
      },
    });

    // Send scan notification email
    await transporter.sendMail({
      from: `"QRGATE" <${process.env.EMAIL_USER}>`,
      to: ticket.user.email,
      subject: "Your Ticket Was Scanned",
      html: ticketScanNotificationEmail({
        name: ticket.user.name ?? "",
        eventTitle: ticket.event.title,
        scanTime: now.toLocaleString(),
        eventWindowStart: start.toLocaleString(),
        eventWindowEnd: end.toLocaleString(),
        eventLocation: ticket.event.location,
      }),
    });

    // Return ticket info and scan count
    return NextResponse.json({
      valid: true,
      message: "Ticket is valid for entry/exit.",
      ticket: ticket,
      scanCount,
      eventWindow: { start, end },
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
