require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");
const { job: keepAliveJob } = require("./cron");

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });

  if (process.env.NODE_ENV === "production") {
    keepAliveJob.start();
  }
}

start();