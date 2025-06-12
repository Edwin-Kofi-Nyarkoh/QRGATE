import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import prisma from "./prisma";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function createTicketsDirectly(order: any, quantity: number) {
  const { generateQRCode } = await import("@/lib/qr-code");

  for (let i = 0; i < quantity; i++) {
    const ticketNumber = order.event.soldTickets + i + 1;

    const qrCode = await generateQRCode({
      eventId: order.eventId,
      userId: order.userId,
      orderId: order.id,
      ticketNumber,
      timestamp: Date.now(),
    });

    await prisma.ticket.create({
      data: {
        eventId: order.eventId,
        userId: order.userId,
        orderId: order.id,
        type: "Standard",
        price: order.event.price,
        qrCode,
      },
    });
  }

  // Update event sold tickets count
  await prisma.event.update({
    where: { id: order.eventId },
    data: {
      soldTickets: {
        increment: quantity,
      },
    },
  });
}
