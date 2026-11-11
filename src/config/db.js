
const mongoose = require("mongoose");

exports.connectDb = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URL;
    const dbName = process.env.DB_NAME || (process.env.NODE_ENV === "production" ? "test" : "connectify");

    if (!mongoUrl) {
      throw new Error("MONGODB_URL is missing from environment variables.");
    }

    await mongoose.connect(mongoUrl, {
      dbName,
      serverSelectionTimeoutMS: 15000,
      autoSelectFamily: false,
    });

    console.log(`Database connected successfully: ${dbName}`);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};
