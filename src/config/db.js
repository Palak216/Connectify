
const mongoose = require("mongoose");

exports.connectDb = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URL;
    const dbName = process.env.DB_NAME;

    if (!mongoUrl) {
      throw new Error("MONGODB_URL is missing from environment variables.");
    }

    if (!dbName || dbName !== "mini_instagram") {
      throw new Error("DB_NAME must be set to mini_instagram.");
    }

    await mongoose.connect(mongoUrl, {
      dbName,
      serverSelectionTimeoutMS: 15000,
      autoSelectFamily: false,
    });

    console.log(`DB Connected Successfully: ${dbName}`);
  } catch (error) {
    console.error("DB Connection Failed:", error.message);
    throw error;
  }
};
