"use strict";

// Cron job to hit our own /health endpoint every 14 minutes so that
// hosts which spin down idle free-tier instances (e.g. Render) never
// see the backend go quiet long enough to sleep it.
const { CronJob } = require("cron");
const https = require("https");

const backendUrl =
  process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL;

const job = new CronJob("*/14 * * * *", function () {
  if (!backendUrl) {
    console.warn(
      "[keep-alive] BACKEND_URL is not set, skipping ping"
    );
    return;
  }

  const target = `${backendUrl.replace(/\/+$/, "")}/health`;

  https
    .get(target, (res) => {
      if (res.statusCode === 200) {
        console.log("[keep-alive] Ping OK");
      } else {
        console.error(
          `[keep-alive] Ping failed with status code: ${res.statusCode}`
        );
      }
      res.resume();
    })
    .on("error", (err) => {
      console.error(
        "[keep-alive] Ping errored:",
        err.message
      );
    });
});

module.exports = {
  job,
};
