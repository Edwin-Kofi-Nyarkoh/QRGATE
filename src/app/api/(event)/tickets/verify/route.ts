import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return new Response("Missing code", { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { code },
      include: {
        user: true,
        event: true,
      },
    });

    if (!ticket) {
      return new Response(JSON.stringify({ valid: false, message: "Ticket not found" }), {
        status: 404,
      });
    }

    if (ticket.isExpired) {
      return new Response(JSON.stringify({ valid: false, message: "Ticket already expired" }), {
        status: 410,
      });
    }

    if (ticket.used >= ticket.quantity) {
      // Auto-mark as expired if overused
      await prisma.ticket.update({
        where: { code },
        data: {
          isExpired: true,
        },
      });

      return new Response(
        JSON.stringify({ valid: false, message: "Ticket fully used and now expired" }),
        { status: 410 }
      );
    }

    // ✅ Update ticket: increase used count
    const updatedTicket = await prisma.ticket.update({
      where: { code },
      data: {
        used: ticket.used + 1,
        isExpired: ticket.used + 1 >= ticket.quantity, // expire if this was last use
      },
      include: {
        user: true,
        event: true,
        order: true,
      },
    });

    return new Response(
      JSON.stringify({
        valid: true,
        message: "Ticket valid",
        ticket: {
          email: updatedTicket.user.email,
          event: updatedTicket.event.name,
          used: updatedTicket.used,
          quantity: updatedTicket.quantity,
          isExpired: updatedTicket.isExpired,
          orderId: updatedTicket.order?.id ?? null,
        },
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("QR Code verification error:", err);
    return new Response("Server error", { status: 500 });
  }
}
