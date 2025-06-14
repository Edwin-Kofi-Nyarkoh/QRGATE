import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const organizerId = searchParams.get("organizerId");
    const dateFilter = searchParams.get("dateFilter"); // 'upcoming', 'past', 'ongoing'

    const now = new Date();
    let where: any = {
      ...(category && { category: category.toLowerCase() }),
      ...(organizerId && { organizerId }),
    };

    // Only apply date-based filtering if dateFilter is explicitly provided
    if (dateFilter === "upcoming") {
      where.endDate = { gte: now };
    } else if (dateFilter === "past") {
      where.endDate = { lt: now };
    } else if (dateFilter === "ongoing") {
      where.startDate = { lte: now };
      where.endDate = { gte: now };
    } else if (status) {
      // Only filter by status if provided
      where.status = status;
    }
    // If neither status nor dateFilter is provided, return all events (optionally, you can default to upcoming if you want)

    const events = await prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ticketTypes: true,
        _count: {
          select: {
            tickets: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    const total = await prisma.event.count({ where });

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      location,
      startDate,
      endDate,
      price,
      totalTickets,
      organizerId,
      mainImage,
      images, // array of urls
      ticketTypes = [], // array of ticket types
    } = body;

    // Create the event
    const event = await prisma.event.create({
      data: {
        title,
        description,
        category: category.toLowerCase(),
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        price: Number.parseFloat(price),
        totalTickets: Number.parseInt(totalTickets),
        organizerId,
        mainImage,
        images:
          images && Array.isArray(images)
            ? {
                create: images.map((url: string) => ({ url })),
              }
            : undefined,
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        images: true,
      },
    });

    // Create ticket types if provided
    if (ticketTypes && ticketTypes.length > 0) {
      await prisma.ticketType.createMany({
        data: ticketTypes.map((type: any) => ({
          name: type.name,
          price: Number.parseFloat(type.price),
          quantity: Number.parseInt(type.quantity),
          description: type.description,
          eventId: event.id,
        })),
      });
    } else {
      // Create default ticket type if none provided
      await prisma.ticketType.create({
        data: {
          name: "Standard",
          price: Number.parseFloat(price),
          quantity: Number.parseInt(totalTickets),
          description: "Standard admission",
          eventId: event.id,
        },
      });
    }

    // Fetch the event with ticket types
    const eventWithTicketTypes = await prisma.event.findUnique({
      where: { id: event.id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        images: true,
        ticketTypes: true,
      },
    });

    return NextResponse.json(eventWithTicketTypes, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
