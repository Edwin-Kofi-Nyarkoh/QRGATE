import { CronJob } from "cron";
import prisma from "@/lib/prisma";

// Function to update event statuses
async function updateEventStatuses() {
  const now = new Date();

  try {
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

    console.log(
      `Updated ${startedEvents.count} events to ONGOING and ${endedEvents.count} events to COMPLETED`
    );
  } catch (error) {
    console.error("Error updating event statuses:", error);
  }
}

// Initialize cron jobs
export function initCronJobs() {
  // Run every 5 minutes
  const eventStatusJob = new CronJob("*/5 * * * *", updateEventStatuses);

  // Start the job
  eventStatusJob.start();

  console.log("Cron jobs initialized");

  return {
    eventStatusJob,
  };
}
