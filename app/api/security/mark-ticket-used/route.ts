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

    // Find and update the ticket
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

    if (ticket.isUsed) {
      return NextResponse.json(
        { message: "Ticket has already been used" },
        { status: 409 }
      );
    }

    // Mark ticket as used
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    // Log the action
    await prisma.verificationLog.create({
      data: {
        ticketId: ticket.id,
        securityOfficerId: securityOfficer.id,
        eventId: eventId,
        action: "MARKED_USED",
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
      ticket: updatedTicket,
      message: "Ticket marked as used successfully",
      stats: {
        totalVerified: stats._count.id,
        recentActivity: stats._count.id,
      },
    });
  } catch (error) {
    console.error("Error marking ticket as used:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
