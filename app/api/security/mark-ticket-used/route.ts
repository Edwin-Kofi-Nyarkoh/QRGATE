import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { ticketId, eventId, securityId } = await request.json();

    if (!ticketId || !eventId || !securityId) {
      return NextResponse.json(
        { message: "Ticket ID, event ID, and security ID are required" },
        { status: 400 }
      );
    }

    // Verify security officer authorization
    const securityOfficer = await prisma.securityOfficer.findFirst({
      where: {
        id: securityId,
        eventId: eventId,
        active: true,
      },
    });

    if (!securityOfficer) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid security officer or event access" },
        { status: 403 }
      );
    }

    // Find the ticket
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        eventId: eventId,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 }
      );
    }

    // Fetch event start/end
    const event = await prisma.event.findUnique({
      where: { id: ticket.eventId },
      select: { startDate: true, endDate: true },
    });
    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (now < start) {
      return NextResponse.json(
        {
          message: `Ticket marking is not allowed before the event starts. Event starts at ${start.toLocaleString()}`,
        },
        { status: 403 }
      );
    }
    if (now > end) {
      return NextResponse.json(
        {
          message: `Ticket marking is not allowed after the event ends. Event ended at ${end.toLocaleString()}`,
        },
        { status: 403 }
      );
    }

    // Count previous marks for this ticket during the event
    const markCount = await prisma.verificationLog.count({
      where: {
        ticketId: ticket.id,
        eventId: ticket.eventId,
        timestamp: {
          gte: start,
          lte: end,
        },
        action: "MARKED_USED",
      },
    });
    const MAX_MARKS_PER_TICKET = 100; // or set dynamically per event
    if (markCount >= MAX_MARKS_PER_TICKET) {
      return NextResponse.json(
        {
          message: `This ticket has reached the maximum number of allowed marks for this event.`,
        },
        { status: 429 }
      );
    }

    // Log the mark (do not update isUsed/usedAt)
    await prisma.verificationLog.create({
      data: {
        ticketId: ticket.id,
        securityOfficerId: securityOfficer.id,
        eventId: eventId,
        action: "MARKED_USED",
        details: "Ticket marked as used for entry/exit",
        timestamp: now,
      },
    });

    // Get updated verification stats
    const stats = await prisma.verificationLog.aggregate({
      where: {
        securityOfficerId: securityOfficer.id,
        eventId: eventId,
      },
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      ticket: ticket,
      message: `Ticket marked as used successfully (${
        markCount + 1
      } times this event)`,
      stats: {
        totalVerified: stats._count.id,
        recentActivity: stats._count.id,
      },
      markCount: markCount + 1,
      eventWindow: { start, end },
    });
  } catch (error) {
    console.error("Error marking ticket as used:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
