import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { ticketId, eventId } = await request.json();

    if (!ticketId || !eventId) {
      return NextResponse.json(
        { message: "Ticket ID and Event ID are required" },
        { status: 400 }
      );
    }

    // Verify the ticket exists and belongs to the event
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        eventId: eventId,
      },
      include: {
        event: {
          include: {
            organizer: true,
          },
        },
        user: true,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 }
      );
    }

    // Check if ticket is already used
    if (ticket.isUsed) {
      return NextResponse.json(
        {
          message: "Ticket has already been used",
          usedAt: ticket.usedAt,
        },
        { status: 409 }
      );
    }

    // Verify user has permission (organizer or security officer)
    const isOrganizer = ticket.event.organizerId;

    if (!isOrganizer) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Mark ticket as used
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
      include: {
        user: true,
        event: true,
        order: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Ticket marked as used successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Error marking ticket as used:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
