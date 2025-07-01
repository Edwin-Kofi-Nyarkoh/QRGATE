import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        images: true,
        ticketTypes: true,
        tickets: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
            ticketType: true,
          },
        },
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Fetch current images for the event
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        images: true,
        ticketTypes: true,
      },
    });
    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Handle ticket types update
    const { ticketTypes, ...eventData } = body;

    if (ticketTypes && Array.isArray(ticketTypes)) {
      // Process each ticket type
      for (const ticketType of ticketTypes) {
        if (ticketType.id) {
          // Update existing ticket type
          await prisma.ticketType.update({
            where: { id: ticketType.id },
            data: {
              name: ticketType.name,
              price: Number(ticketType.price),
              quantity: Number(ticketType.quantity),
              description: ticketType.description,
            },
          });
        } else {
          // Create new ticket type
          await prisma.ticketType.create({
            data: {
              name: ticketType.name,
              price: Number(ticketType.price),
              quantity: Number(ticketType.quantity),
              description: ticketType.description,
              eventId: id,
            },
          });
        }
      }

      // Remove ticket types that are not in the update
      const updatedTypeIds = ticketTypes
        .filter((t: any) => t.id)
        .map((t: any) => t.id);

      const existingTypeIds = existingEvent.ticketTypes.map((t) => t.id);

      const typeIdsToDelete = existingTypeIds.filter(
        (typeId) => !updatedTypeIds.includes(typeId)
      );

      if (typeIdsToDelete.length > 0) {
        await prisma.ticketType.deleteMany({
          where: {
            id: { in: typeIdsToDelete },
            // Only delete if no tickets have been sold
            soldCount: 0,
          },
        });
      }
    }

    // Incoming images from frontend: array of { url } or just url strings
    const incomingImages: Array<{ id?: string; url: string }> =
      body.images?.map((img: any) =>
        typeof img === "string" ? { url: img } : img
      ) || [];

    // Existing images in DB
    const existingImages = existingEvent.images;

    // Images to keep (by url)
    const incomingUrls = incomingImages.map((img) => img.url);
    const existingToKeep = existingImages.filter((img) =>
      incomingUrls.includes(img.url)
    );
    // Images to create (new urls not in DB)
    const toCreate = incomingImages.filter(
      (img) => !existingImages.some((e) => e.url === img.url)
    );
    // Images to delete (in DB but not in incoming)
    const toDelete = existingImages.filter(
      (img) => !incomingUrls.includes(img.url)
    );

    // Prepare Prisma nested update
    const imagesUpdate = {
      set: existingToKeep.map((img) => ({ id: img.id })),
      create: toCreate.map((img) => ({ url: img.url })),
      deleteMany: toDelete.length
        ? toDelete.map((img) => ({ id: img.id }))
        : undefined,
    };

    // Remove images and ticketTypes from body to avoid direct update
    const { images, ...restEventData } = eventData;

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...restEventData,
        images: imagesUpdate,
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
        ticketTypes: true,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
