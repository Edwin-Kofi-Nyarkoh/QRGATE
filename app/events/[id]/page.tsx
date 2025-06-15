import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { EventDetails } from "@/components/events/event-details";
import { RelatedEvents } from "@/components/events/related-events";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: `${event.title} | QRGate`,
    description: event.description,
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
      _count: {
        select: {
          tickets: true,
        },
      },
    },
  });

  if (!event) {
    notFound();
    return null;
  }

  // Get related events (same category)
  const relatedEvents = await prisma.event.findMany({
    where: {
      category: event.category,
      id: { not: event.id },
      status: "UPCOMING",
    },
    include: {
      _count: {
        select: {
          tickets: true,
        },
      },
    },
    take: 3,
  });

  return (
    <div className="min-h-screen">
      <EventDetails event={event} />
      <RelatedEvents events={relatedEvents} />
    </div>
  );
}
