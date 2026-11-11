
const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const { connectDb } = require("./src/config/db");

const authRoutes = require("./src/routes/auth");
const postRoutes = require("./src/routes/posts");

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

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    await connectDb();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening on port ${PORT}`);
      console.log("Database connected successfully.");
    });
  } catch (error) {
    console.error("Application startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
