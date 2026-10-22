const mongoose = require("mongoose");

exports.connectDb = async () => {
  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL is missing from environment variables.");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log("Database connected successfully.");
  } catch (error) {
    // Do not log the URI or full driver error; they can contain credentials.
    console.error("Database connection failed:", error.name || "ConnectionError", error.code || "");
    throw error;
  }
};
