import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Start a transaction to delete all related data
    await prisma.$transaction(async (tx) => {
      // Delete user's tickets
      await tx.ticket.deleteMany({
        where: { userId },
      });

      // Delete user's orders
      await tx.order.deleteMany({
        where: { userId },
      });

      // Delete user's verification logs
      await tx.verificationLog.deleteMany({
        where: {
          ticket: {
            userId: userId,
          },
        },
      });

      // If user is an organizer, delete their events and related data
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { isOrganizer: true },
      });

      if (user?.isOrganizer) {
        // Get all events created by this organizer
        const organizerEvents = await tx.event.findMany({
          where: { organizerId: userId },
          select: { id: true },
        });

        const eventIds = organizerEvents.map((event) => event.id);

        if (eventIds.length > 0) {
          // Delete tickets for these events
          await tx.ticket.deleteMany({
            where: { eventId: { in: eventIds } },
          });

          // Delete orders for these events
          await tx.order.deleteMany({
            where: { eventId: { in: eventIds } },
          });

          // Delete security officers for these events
          await tx.securityOfficer.deleteMany({
            where: { eventId: { in: eventIds } },
          });

          // Delete verification logs for these events
          await tx.verificationLog.deleteMany({
            where: { eventId: { in: eventIds } },
          });

          // Delete the events themselves
          await tx.event.deleteMany({
            where: { id: { in: eventIds } },
          });
        }
      }

      // Delete security officer records where user is a security officer
      await tx.securityOfficer.deleteMany({
        where: { userId },
      });

      // Delete password reset tokens
      await tx.passwordResetToken.deleteMany({
        where: { userId },
      });

      // Finally, delete the user account
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
