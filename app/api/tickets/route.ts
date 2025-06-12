import { type NextRequest, NextResponse } from "next/server";
import { generateQRCode } from "@/lib/qr-code";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, userId, orderId, type = "Standard", quantity = 1 } = body;

    // Validate required fields
    if (!eventId || !userId || !orderId) {
      return NextResponse.json(
        { error: "Missing required fields: eventId, userId, orderId" },
        { status: 400 }
      );
    }

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if tickets already exist for this order
    const existingTickets = await prisma.ticket.findMany({
      where: { orderId },
    });

    if (existingTickets.length > 0) {
      return NextResponse.json({
        message: "Tickets already exist for this order",
        tickets: existingTickets,
      });
    }

    // Check if enough tickets are available
    if (event.soldTickets + quantity > event.totalTickets) {
      return NextResponse.json(
        { error: "Not enough tickets available" },
        { status: 400 }
      );
    }

    // Create tickets
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticketNumber = event.soldTickets + i + 1;

      // Generate QR code with proper data
      const qrCode = await generateQRCode({
        eventId,
        userId,
        orderId,
        ticketNumber,
        timestamp: Date.now(),
      });

      const ticket = await prisma.ticket.create({
        data: {
          eventId,
          userId,
          orderId,
          type,
          price: event.price,
          qrCode,
        },
      });

      tickets.push(ticket);
    }

    // Update event sold tickets count
    await prisma.event.update({
      where: { id: eventId },
      data: {
        soldTickets: {
          increment: quantity,
        },
      },
    });

    return NextResponse.json(
      {
        message: "Tickets created successfully",
        tickets,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating tickets:", error);
    return NextResponse.json(
      { error: "Failed to create tickets" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const orderId = searchParams.get("orderId");
    const eventId = searchParams.get("eventId");

    const where = {
      ...(userId && { userId }),
      ...(orderId && { orderId }),
      ...(eventId && { eventId }),
    };

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            mainImage: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            status: true,
            total: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
