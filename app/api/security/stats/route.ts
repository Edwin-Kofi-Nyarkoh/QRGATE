import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const securityId = searchParams.get("securityId");

    if (!eventId || !securityId) {
      return NextResponse.json(
        { message: "Event ID and security ID are required" },
        { status: 400 }
      );
    }

    // Verify security officer authorization
    const securityOfficer = await prisma.securityOfficer.findFirst({
      where: {
        id: securityId,
        eventId: eventId,
        active: true,
      },
    });

    if (!securityOfficer) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid security officer or event access" },
        { status: 403 }
      );
    }

    // Get verification statistics for this security officer
    const [totalVerifications, todayVerifications, recentActivity] =
      await Promise.all([
        // Total verifications by this officer
        prisma.verificationLog.count({
          where: {
            securityOfficerId: securityId,
            eventId: eventId,
          },
        }),

        // Today's verifications
        prisma.verificationLog.count({
          where: {
            securityOfficerId: securityId,
            eventId: eventId,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),

        // Recent activity (last 10 verifications)
        prisma.verificationLog.findMany({
          where: {
            securityOfficerId: securityId,
            eventId: eventId,
          },
          include: {
            ticket: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        }),
      ]);

    // Get hourly verification data for today
    const hourlyData = await prisma.verificationLog.groupBy({
      by: ["createdAt"],
      where: {
        securityOfficerId: securityId,
        eventId: eventId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      _count: {
        id: true,
      },
    });

    // Process hourly data
    const hourlyStats = Array.from({ length: 24 }, (_, hour) => {
      const hourStart = new Date();
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date();
      hourEnd.setHours(hour, 59, 59, 999);

      const count = hourlyData.filter((item) => {
        const itemDate = new Date(item.createdAt);
        return itemDate >= hourStart && itemDate <= hourEnd;
      }).length;

      return {
        hour: `${hour.toString().padStart(2, "0")}:00`,
        verifications: count,
      };
    });

    const stats = {
      totalVerifications,
      todayVerifications,
      hourlyStats,
      recentActivity: recentActivity.map((log) => ({
        id: log.id,
        action: log.action,
        timestamp: log.createdAt,
        ticketHolder: log.ticket.user.name || log.ticket.user.email,
      })),
    };

    return NextResponse.json({ stats, recentActivity });
  } catch (error) {
    console.error("Error fetching security stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
