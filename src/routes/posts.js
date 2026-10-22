const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const isLoggedIn = require("../middlewares/authmiddleware");
const {
  createPost,
  getAllPosts,
  deletePost,
  toggleLike,
  addComment,
} = require("../controllers/postController");

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const fileFilter = (_req, file, callback) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return callback(new Error("Only JPEG, PNG, WEBP, and GIF images are allowed"));
  }
  return callback(null, true);
};

let storage;
if (cloudinary.isConfigured) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "mini-instagram",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      resource_type: "image",
    },
  });
} else if (process.env.NODE_ENV === "production") {
  storage = multer.memoryStorage();
} else {
  const uploadDir = path.join(process.cwd(), "uploads");
  fs.mkdirSync(uploadDir, { recursive: true });
  storage = multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDir),
    filename: (_req, file, callback) => {
      callback(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${path.extname(file.originalname).toLowerCase()}`);
    },
  });
}

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024, files: 1 }, fileFilter });

router.get("/posts", isLoggedIn, getAllPosts);
router.post("/posts", isLoggedIn, (req, res, next) => {
  return upload.single("image")(req, res, (error) => {
    if (error) return res.status(400).json({ message: error.message || "Image upload failed" });
    if (req.file && process.env.NODE_ENV === "production" && !cloudinary.isConfigured) {
      return res.status(503).json({ message: "Image uploads are not configured on this server" });
    }
    return next();
  });
}, createPost);
router.delete("/posts/:id", isLoggedIn, deletePost);
router.post("/posts/:id/like", isLoggedIn, toggleLike);
router.post("/posts/:id/comments", isLoggedIn, addComment);

module.exports = router;
