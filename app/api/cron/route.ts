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

    // Set status to ONGOING for all events where startDate <= now < endDate
    const ongoingEvents = await prisma.event.updateMany({
      where: {
        startDate: { lte: now },
        endDate: { gt: now },
        status: { not: "ONGOING" },
      },
      data: { status: "ONGOING" },
    });

    // Set status to COMPLETED for all events where endDate <= now
    const completedEvents = await prisma.event.updateMany({
      where: {
        endDate: { lte: now },
        status: { not: "COMPLETED" },
      },
      data: { status: "COMPLETED" },
    });

    // Set status to UPCOMING for all events where startDate > now
    const upcomingEvents = await prisma.event.updateMany({
      where: {
        startDate: { gt: now },
        status: { not: "UPCOMING" },
      },
      data: { status: "UPCOMING" },
    });

    return NextResponse.json({
      success: true,
      updatedToOngoing: ongoingEvents.count,
      updatedToCompleted: completedEvents.count,
      updatedToUpcoming: upcomingEvents.count,
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
