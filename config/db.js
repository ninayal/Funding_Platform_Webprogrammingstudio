const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("[DB] Thiếu MONGODB_URI trong .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("[DB] Đã kết nối MongoDB Atlas");
  } catch (err) {
    console.error("[DB] Kết nối thất bại:", err.message);
    process.exit(1);
  }
}

module.exports = { connectDB };