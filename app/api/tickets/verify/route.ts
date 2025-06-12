import prisma from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { qrCode } = await request.json();

    if (!qrCode) {
      return NextResponse.json(
        { valid: false, message: "QR code is required" },
        { status: 400 }
      );
    }

    // Find the ticket
    const ticket = await prisma.ticket.findUnique({
      where: { qrCode },
      include: {
        event: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profileImage: true,
          },
        },
        order: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({
        valid: false,
        message: "Invalid ticket - not found",
      });
    }

    // Check if ticket is already used
    if (ticket.isUsed) {
      return NextResponse.json({
        valid: false,
        message: `Ticket already used on ${ticket.usedAt?.toLocaleString()}`,
        ticket,
      });
    }

    // Check if event is active (within event date range)
    const now = new Date();
    const eventStart = new Date(ticket.event.startDate);
    const eventEnd = new Date(ticket.event.endDate);

    if (now < eventStart) {
      return NextResponse.json({
        valid: false,
        message: "Event has not started yet",
        ticket,
      });
    }

    if (now > eventEnd) {
      return NextResponse.json({
        valid: false,
        message: "Event has already ended",
        ticket,
      });
    }

    // Mark ticket as used
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
            phone: true,
            profileImage: true,
          },
        },
        order: true,
      },
    });

    return NextResponse.json({
      valid: true,
      message: "Ticket verified successfully - Welcome!",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Ticket verification error:", error);
    return NextResponse.json(
      { valid: false, message: "Verification failed" },
      { status: 500 }
    );
  }
}
