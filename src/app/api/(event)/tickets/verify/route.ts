import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if(!session?.user){
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if(session.user.role !== "ADMIN"){
    return NextResponse.json(
      { error: "Forbidden, this is route is for only Authorised USERS 😟🧑‍💻" },
      { status: 403 }
    );
  }

  try {

    const {searchParams} = new URL(req.url)

    const code = searchParams.get("code");

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

