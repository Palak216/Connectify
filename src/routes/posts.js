const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudinary = require("../config/cloudinary");
const isLoggedIn = require("../middlewares/authmiddleware");

const { 
  createPost, 
  getAllPosts,
  deletePost,
  toggleLike,
  addComment
} = require("../controllers/postController");

// Try to use Cloudinary storage if configured, fallback to disk
let upload;
try {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "mini-instagram",
      allowed_formats: ["jpg", "png", "jpeg"],
    },
  });
  upload = multer({ storage });
} catch (e) {
  // Fallback to local storage
  const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, "uploads/"); },
    filename: function (req, file, cb) { cb(null, Date.now() + "-" + file.originalname); }
  });
  upload = multer({ storage });
}

// ================= ROUTES =================

// Get all posts (Feed)
router.get("/posts", isLoggedIn, getAllPosts);

// Create post
router.post("/posts", isLoggedIn, upload.single("image"), createPost);

// Delete post
router.delete("/posts/:id", isLoggedIn, deletePost);

// Toggle Like
router.post("/posts/:id/like", isLoggedIn, toggleLike);

// Add Comment
router.post("/posts/:id/comments", isLoggedIn, addComment);

module.exports = router;
