
const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const { connectDb } = require("./src/config/db");
const { initSocket } = require("./src/socket");

const authRoutes = require("./src/routes/auth");
const postRoutes = require("./src/routes/posts");
const userRoutes = require("./src/routes/users");
const commentRoutes = require("./src/routes/comments");
const notificationRoutes = require("./src/routes/notifications");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header, such as local tools.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Local image serving for development.
// We'll configure persistent image storage for production separately.
const uploadDir = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadDir));

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

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);

// Global error handler
app.use((err, req, res, next) => {
  if (err.message === "Origin not allowed by CORS") {
    return res.status(403).json({ message: "Origin not allowed by CORS" });
  }
  console.error("Unhandled error:", err.message);
  return res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);
initSocket(server, allowedOrigins);

async function startServer() {
  try {
    await connectDb();

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening on port ${PORT}`);
      console.log("Database connected successfully.");
    });
  } catch (error) {
    console.error("Application startup failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

app.server = server;
module.exports = app;
