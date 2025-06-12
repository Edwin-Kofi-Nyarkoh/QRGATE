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
        tickets: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
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
      include: { images: true },
    });
    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
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

    // Remove images from body to avoid direct update
    const { images, ...eventData } = body;

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...eventData,
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
