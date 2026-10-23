const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const { connectDb } = require("./src/config/db");

const authRoutes = require("./src/routes/auth");
const postRoutes = require("./src/routes/posts");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Serve locally uploaded images
const uploadDir = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadDir));

// Register API routes
if (typeof authRoutes !== "function") {
  throw new TypeError(
    'The module "./src/routes/auth" must export an Express router.'
  );
}

if (typeof postRoutes !== "function") {
  throw new TypeError(
    'The module "./src/routes/posts" must export an Express router.'
  );
}

app.use("/api/auth", authRoutes);
app.use("/api", postRoutes);

// Start the server after the database connects
const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    await connectDb();

    app.listen(PORT, "127.0.0.1", () => {
      console.log(`Server running on http://127.0.0.1:${PORT}`);
      console.log("Database connected successfully.");
      console.log("Local image uploads are served from /uploads.");
    });
  } catch (error) {
    console.error("Application startup failed.");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();

