import { type NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/paystack";
import prisma from "@/lib/prisma";
import { generateQRCode } from "@/lib/qr-code";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required" },
        { status: 400 }
      );
    }

    // Verify payment with PayStack
    const paymentData = await verifyPayment(reference);

    if (paymentData.status !== "success") {
      return NextResponse.json(
        { error: "Payment was not successful" },
        { status: 400 }
      );
    }

    // Find order by reference
    const order = await prisma.order.findFirst({
      where: { reference },
      include: {
        event: true,
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "COMPLETED",
        paymentId: paymentData.id.toString(),
      },
    });

    // Generate tickets for the order
    const ticketCount = await prisma.ticket.count({
      where: { orderId: order.id },
    });

    if (ticketCount === 0) {
      // Create tickets for this order
      const tickets = [];
      const quantity = Math.round(order.total / order.event.price);

      for (let i = 0; i < quantity; i++) {
        const qrCode = await generateQRCode({
          eventId: order.eventId,
          userId: order.userId,
          orderId: order.id,
          ticketNumber: order.event.soldTickets + i + 1,
        });

        const ticket = await prisma.ticket.create({
          data: {
            eventId: order.eventId,
            userId: order.userId,
            orderId: order.id,
            type: "Standard", // Default type
            price: order.event.price,
            qrCode,
          },
        });

        tickets.push(ticket);
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

      return NextResponse.json({
        success: true,
        order: updatedOrder,
        tickets,
      });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
