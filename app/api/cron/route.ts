import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// This endpoint will be called by a cron job to update event statuses
export async function GET(request: Request) {
  try {
    // Check for authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Update events that have started but not ended to ONGOING
    const startedEvents = await prisma.event.updateMany({
      where: {
        startDate: {
          lte: now,
        },
        endDate: {
          gt: now,
        },
        status: "UPCOMING",
      },
      data: {
        status: "ONGOING",
      },
    });

    // Update events that have ended to COMPLETED
    const endedEvents = await prisma.event.updateMany({
      where: {
        endDate: {
          lte: now,
        },
        status: "ONGOING",
      },
      data: {
        status: "COMPLETED",
      },
    });

    return NextResponse.json({
      success: true,
      startedEvents: startedEvents.count,
      endedEvents: endedEvents.count,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Error updating event statuses:", error);
    return NextResponse.json(
      { error: "Failed to update event statuses" },
      { status: 500 }
    );
  }
}
