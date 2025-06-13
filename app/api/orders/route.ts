import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { generateQRCode } from "@/lib/qr-code";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const status = searchParams.get("status");

    const where = {
      userId: session.user.id,
      ...(status && { status: status as any }),
    };

    const orders = await prisma.order.findMany({
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
        tickets: {
          include: {
            ticketType: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    const total = await prisma.order.count({ where });

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
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
    const { eventId, quantity = 1, total, ticketTypeId } = body;

    // Fetch the event to get price information
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ticketTypes: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get the ticket type
    let ticketType;
    if (ticketTypeId) {
      ticketType = event.ticketTypes.find((type) => type.id === ticketTypeId);
      if (!ticketType) {
        return NextResponse.json(
          { error: "Ticket type not found" },
          { status: 404 }
        );
      }
    } else {
      // Use the first ticket type as default
      ticketType = event.ticketTypes[0];
    }

    if (!ticketType) {
      return NextResponse.json(
        { error: "No ticket types available for this event" },
        { status: 400 }
      );
    }

    // Check if there are enough tickets available
    const availableTickets = ticketType.quantity - ticketType.soldCount;
    if (availableTickets < quantity) {
      return NextResponse.json(
        { error: "Not enough tickets available" },
        { status: 400 }
      );
    }

    // Calculate the total price
    const orderTotal = total || ticketType.price * quantity;

    // Create the order
    const order = await prisma.order.create({
      data: {
        total: orderTotal,
        userId: session.user.id,
        eventId,
      },
      include: {
        event: true,
      },
    });

    // Create tickets for the order
    const ticketsToCreate = [];
    for (let i = 0; i < quantity; i++) {
      const qrCode = await generateQRCode({
        eventId,
        userId: session.user.id,
        orderId: order.id,
        ticketNumber: i + 1,
        timestamp: Date.now(),
      });
      ticketsToCreate.push({
        qrCode,
        type: ticketType.name,
        price: ticketType.price,
        eventId,
        userId: session.user.id,
        orderId: order.id,
        ticketTypeId: ticketType.id,
      });
    }

    await prisma.ticket.createMany({
      data: ticketsToCreate,
    });

    // Update ticket type sold count
    await prisma.ticketType.update({
      where: { id: ticketType.id },
      data: {
        soldCount: {
          increment: quantity,
        },
      },
    });

    // Update event sold tickets count
    await prisma.event.update({
      where: { id: eventId },
      data: {
        soldTickets: {
          increment: quantity,
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
