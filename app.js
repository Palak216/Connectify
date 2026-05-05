const express = require("express");
const path = require("path");
require("dotenv").config();
const { connectDb } = require("./src/config/db");

const app = express();

// Connect to MongoDB
connectDb();

// ---------------------
// Middleware
// ---------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Allow CORS for frontend
const cors = require("cors");
app.use(cors());

// Static folder (for uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------------------
// Routes
// ---------------------
const authRoutes = require("./src/routes/auth");
const postRoutes = require("./src/routes/posts");
// Removed feedRoutes and commentRoutes for now as we transition to API

app.use("/api/auth", authRoutes);
app.use("/api", postRoutes);

// ---------------------
// Server
// ---------------------
const PORT = 8080; // Hardcoding to avoid any hidden conflicts
app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
