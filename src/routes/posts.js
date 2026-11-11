const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middlewares/authmiddleware");
const { upload, handleUploadError } = require("../middlewares/upload");
const {
  createPost,
  getAllPosts,
  deletePost,
  toggleLike,
  addComment,
  getComments,
  getFeed,
} = require("../controllers/postController");

// Feed for followed users (cursor-based pagination)
router.get("/feed", isLoggedIn, getFeed);
router.get("/posts/feed", isLoggedIn, getFeed);

// Get all posts
router.get("/posts", isLoggedIn, getAllPosts);

// Create a post with an optional image
router.post(
  "/posts",
  isLoggedIn,
  upload.single("image"),
  createPost
);

// Delete a post
router.delete("/posts/:id", isLoggedIn, deletePost);

// Like or unlike a post
router.post("/posts/:id/like", isLoggedIn, toggleLike);

// Get paginated comments for a post
router.get("/posts/:id/comments", isLoggedIn, getComments);

// Add a comment
router.post("/posts/:id/comments", isLoggedIn, addComment);

// Handle upload errors
router.use(handleUploadError);

module.exports = router;
