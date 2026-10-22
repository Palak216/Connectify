require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const { connectDb } = require("./src/config/db");

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Permit non-browser clients (curl, health checks) and configured frontends.
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin is not allowed by CORS"));
  },
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    database: require("mongoose").connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/auth", require("./src/routes/auth"));
app.use("/api", require("./src/routes/posts"));

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, _req, res, _next) => {
  if (err && err.message === "Origin is not allowed by CORS") {
    return res.status(403).json({ message: "Origin is not allowed by CORS" });
  }
  if (err && err.name === "MulterError") {
    return res.status(400).json({ message: "Image upload failed", error: err.message });
  }
  console.error("Unhandled request error:", err?.message || "Unknown error");
  return res.status(500).json({ message: "Internal server error" });
});

const PORT = Number(process.env.PORT) || 8080;

async function startServer() {
  try {
    await connectDb();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch {
    console.error("Application startup failed because MongoDB is unavailable.");
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
