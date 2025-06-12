import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { items, userInfo, paymentMethod, total } = await request.json();

    // If user is not logged in, we'll create a guest order
    const userId = session?.user?.id;

    if (!userId && userInfo) {
      // For guest checkout, we could create a temporary user or handle differently
      // For now, we'll require authentication
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // Create orders for each event (since each event needs its own order)
    const orders = [];

    for (const item of items) {
      // Validate event exists and has available tickets
      const event = await prisma.event.findUnique({
        where: { id: item.eventId },
      });

      if (!event) {
        return NextResponse.json(
          { error: `Event ${item.eventId} not found` },
          { status: 404 }
        );
      }

      if (event.soldTickets + item.quantity > event.totalTickets) {
        return NextResponse.json(
          { error: `Not enough tickets available for ${event.title}` },
          { status: 400 }
        );
      }

      // Create order
      const order = await prisma.order.create({
        data: {
          userId: userId!,
          eventId: item.eventId,
          total: item.price * item.quantity,
          status: "PENDING",
          paymentMethod,
        },
      });

      orders.push(order);
    }

    return NextResponse.json({ orders }, { status: 201 });
  } catch (error) {
    console.error("Error creating orders:", error);
    return NextResponse.json(
      { error: "Failed to create orders" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");

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
        tickets: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    const total = await prisma.order.count({ where });

    return NextResponse.json({
      data: orders,
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
