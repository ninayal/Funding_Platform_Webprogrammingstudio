const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("[DB] Missing MONGODB_URI in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { dbName: "langandco" });
    console.log("[DB] Connected to MongoDB Atlas");
  } catch (err) {
    console.error("[DB] Connection Failed:", err.message);
    process.exit(1);
  }
}

module.exports = { connectDB };