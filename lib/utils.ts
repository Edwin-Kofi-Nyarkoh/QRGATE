import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import prisma from "./prisma";
import { generateQRCode } from "./qr-code";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Creates tickets directly for an order
 * @param order The order to create tickets for
 * @param quantity The number of tickets to create
 */
export async function createTicketsDirectly(order: any, quantity: number) {
  const tickets = [];

  try {
    // Get ticket type information if available
    // If you have an orderItem model, use it. Otherwise, skip this block or adjust as needed.
    // const orderItems = await prisma.orderItem.findMany({
    //   where: { orderId: order.id },
    // })
    const orderItems: any[] = []; // fallback: no order items

    let ticketCounter = 0;

    // Create tickets based on order items if available
    if (orderItems.length > 0) {
      for (const item of orderItems) {
        const ticketType = item.ticketType || "Standard";
        const itemQuantity = item.quantity || 1;

        // Find ticket type price if available
        const ticketTypeInfo = await prisma.ticketType.findFirst({
          where: {
            eventId: order.eventId,
            name: ticketType,
          },
        });

        const ticketPrice = ticketTypeInfo?.price || order.event.price;

        // Create tickets for this item
        for (let i = 0; i < itemQuantity; i++) {
          const qrCode = await generateQRCode({
            eventId: order.eventId,
            userId: order.userId,
            orderId: order.id,
            ticketNumber: order.event.soldTickets + ticketCounter + 1,
            timestamp: Date.now(),
          });

          const ticket = await prisma.ticket.create({
            data: {
              eventId: order.eventId,
              userId: order.userId,
              orderId: order.id,
              type: ticketType,
              price: ticketPrice,
              qrCode,
            },
          });

          tickets.push(ticket);
          ticketCounter++;

          // Update ticket type availability if applicable
          if (ticketTypeInfo) {
            await prisma.ticketType.update({
              where: { id: ticketTypeInfo.id },
              data: {
                soldCount: {
                  increment: 1,
                },
              },
            });
          }
        }
      }
    } else {
      // Fallback to creating standard tickets if no order items
      for (let i = 0; i < quantity; i++) {
        const qrCode = await generateQRCode({
          eventId: order.eventId,
          userId: order.userId,
          orderId: order.id,
          ticketNumber: order.event.soldTickets + i + 1,
          timestamp: Date.now(),
        });

        const ticket = await prisma.ticket.create({
          data: {
            eventId: order.eventId,
            userId: order.userId,
            orderId: order.id,
            type: "Standard",
            price: order.event.price,
            qrCode,
          },
        });

        tickets.push(ticket);
      }
    }

    // Update event sold tickets count
    await prisma.event.update({
      where: { id: order.eventId },
      data: {
        soldTickets: {
          increment: tickets.length,
        },
      },
    });

    return tickets;
  } catch (error) {
    console.error("Error creating tickets:", error);
    throw error;
  }
}
