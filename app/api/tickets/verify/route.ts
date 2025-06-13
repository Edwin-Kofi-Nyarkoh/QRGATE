import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { qrCode, eventId } = body;

    if (!qrCode) {
      return NextResponse.json(
        { error: "QR code is required" },
        { status: 400 }
      );
    }

    // Find the ticket by QR code
    const ticket = await prisma.ticket.findFirst({
      where: {
        qrCode,
        eventId,
      },
      include: {
        event: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ticketType: true,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Invalid ticket", valid: false },
        { status: 404 }
      );
    }

    // Check if the ticket has already been used
    if (ticket.isUsed) {
      return NextResponse.json({
        error: "Ticket has already been used",
        valid: false,
        ticket,
      });
    }

    // Check if the event is active
    const now = new Date();
    if (now < ticket.event.startDate) {
      return NextResponse.json({
        error: "Event has not started yet",
        valid: false,
        ticket,
      });
    }

    if (now > ticket.event.endDate) {
      return NextResponse.json({
        error: "Event has already ended",
        valid: false,
        ticket,
      });
    }

    // Check if the security officer is assigned to this event
    const securityOfficer = await prisma.securityOfficer.findFirst({
      where: {
        userId: session.user.id,
        eventId,
        active: true,
      },
    });

    if (!securityOfficer) {
      return NextResponse.json(
        {
          error: "You are not authorized to verify tickets for this event",
          valid: false,
        },
        { status: 403 }
      );
    }

    // Mark the ticket as used
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
      include: {
        event: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ticketType: true,
      },
    });

    return NextResponse.json({
      valid: true,
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Error verifying ticket:", error);
    return NextResponse.json(
      { error: "Failed to verify ticket", valid: false },
      { status: 500 }
    );
  }
}
