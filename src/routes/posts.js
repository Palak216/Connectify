const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middlewares/authmiddleware");
const { upload, handleUploadError } = require("../middlewares/upload");
const validate = require("../middlewares/validate");
const {
  createPostSchema,
  postIdParamSchema,
  addCommentSchema,
} = require("../validations/schemas");

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

// Get all posts (page/limit pagination)
router.get("/posts", isLoggedIn, getAllPosts);

// Create a post with an optional image
router.post(
  "/posts",
  isLoggedIn,
  upload.single("image"),
  validate(createPostSchema),
  createPost
);

// Delete a post
router.delete("/posts/:id", isLoggedIn, validate(postIdParamSchema), deletePost);

// Like or unlike a post
router.post("/posts/:id/like", isLoggedIn, validate(postIdParamSchema), toggleLike);

// Get paginated comments for a post
router.get(
  "/posts/:id/comments",
  isLoggedIn,
  validate(postIdParamSchema),
  getComments
);

// Add a comment
router.post(
  "/posts/:id/comments",
  isLoggedIn,
  validate(addCommentSchema),
  addComment
);

// Handle upload errors
router.use(handleUploadError);

module.exports = router;
