const cron = require("node-cron");

(async () => {
  const fetch = (await import("node-fetch")).default;

  // Get cron schedule from environment variable or default to every minute
  const CRON_SCHEDULE = process.env.CRON_SCHEDULE || "* * * * *";
  const CRON_URL = process.env.CRON_URL || "http://localhost:3000/api/cron";
  const CRON_SECRET_KEY =
    process.env.CRON_SECRET_KEY || "d3f0fa0b57b68edc2b9cc3e0f89bebc653ce4b5d";

  cron.schedule(CRON_SCHEDULE, async () => {
    try {
      const res = await fetch(CRON_URL, {
        headers: {
          Authorization: `Bearer ${CRON_SECRET_KEY}`,
        },
      });
      if (res.ok) {
        console.log("Cron job ran successfully at", new Date().toISOString());
      } else {
        console.error("Cron job failed:", await res.text());
      }
    } catch (err) {
      console.error("Error running cron job:", err);
    }
  });

  console.log(
    `Cron scheduler started with schedule: "${CRON_SCHEDULE}" and URL: ${CRON_URL}`
  );
})();
