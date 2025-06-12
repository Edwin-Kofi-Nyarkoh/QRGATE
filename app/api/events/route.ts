import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status") || "UPCOMING";
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const page = Number.parseInt(searchParams.get("page") || "1");

    const where = {
      status: status as any,
      ...(category && { category: category.toLowerCase() }),
    };

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
    } = body;

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

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
