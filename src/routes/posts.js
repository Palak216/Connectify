
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

const isProduction = process.env.NODE_ENV === "production";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

// Validate image type and extension in both environments.
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(ext)
  ) {
    return cb(null, true);
  }

  return cb(
    new Error("Only JPG, PNG, WebP, and GIF images are allowed.")
  );
};

let storage;

if (isProduction) {
  // Production: store uploaded images in Cloudinary.
  const cloudinary = require("../config/cloudinary");
  const { CloudinaryStorage } = require("multer-storage-cloudinary");

  const requiredCloudinaryVars = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  const missingVars = requiredCloudinaryVars.filter(
    (name) => !process.env[name]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Cloudinary environment variables: ${missingVars.join(", ")}`
    );
  }

  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "connectify/posts",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    },
  });
} else {
  // Local development: preserve disk-based uploads.
  const uploadDir = path.join(__dirname, "../../uploads");
  fs.mkdirSync(uploadDir, { recursive: true });

  storage = multer.diskStorage({
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
}

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter,
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
