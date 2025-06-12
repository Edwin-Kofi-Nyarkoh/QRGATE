// app/api/tickets/route.ts (or pages/api/tickets.ts)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Query tickets by userId
    const tickets = await prisma.ticket.findMany({
      where: { userId },
      include: {
        event: true,  // assuming you want event info alongside
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
