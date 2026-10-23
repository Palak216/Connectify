
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const isLoggedIn = require("../middlewares/authmiddleware");

const {
  createPost,
  getAllPosts,
  deletePost,
  toggleLike,
  addComment,
} = require("../controllers/postController");

// Create uploads folder if it does not exist
const uploadDir = path.join(__dirname, "../../uploads");
fs.mkdirSync(uploadDir, { recursive: true });

// Store uploaded images locally
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${ext}`;

    cb(null, filename);
  },
});

// Basic image-type validation
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

    if (
      allowedMimeTypes.includes(file.mimetype) &&
      allowedExtensions.includes(ext)
    ) {
      return cb(null, true);
    }

    return cb(
      new Error("Only JPG, PNG, WebP, and GIF images are allowed.")
    );
  },
});

// Get all posts
router.get("/posts", isLoggedIn, getAllPosts);

// Create a post with an optional image
router.post("/posts", isLoggedIn, upload.single("image"), createPost);

// Delete a post
router.delete("/posts/:id", isLoggedIn, deletePost);

// Like or unlike a post
router.post("/posts/:id/like", isLoggedIn, toggleLike);

// Add a comment
router.post("/posts/:id/comments", isLoggedIn, addComment);

// Handle upload errors with JSON responses
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        message: "Image must be 5 MB or smaller.",
      });
    }

    return res.status(400).json({
      message: "Image upload failed. Please try again.",
    });
  }

  if (err) {
    return res.status(400).json({
      message: err.message || "Invalid image upload.",
    });
  }

  next();
});

module.exports = router;
