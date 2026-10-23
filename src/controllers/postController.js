
const mongoose = require("mongoose");
const Post = require("../models/post");
const Comment = require("../models/comment");

// ================= CREATE POST =================
exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;

    if (content !== undefined && typeof content !== "string") {
      return res.status(400).json({ message: "Invalid post content" });
    }

    const trimmedContent = content?.trim() || "";
    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    if (!trimmedContent && !imageUrl) {
      return res.status(400).json({
        message: "Post content or an image is required",
      });
    }

    const newPost = new Post({
      content: trimmedContent,
      imageUrl,
      author: userId,
    });

    await newPost.save();

    return res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    console.error("CREATE POST ERROR:", error.message);
    return res.status(500).json({ message: "Error creating post" });
  }
};

// ================= GET ALL POSTS =================
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username" },
      })
      .sort({ createdAt: -1 });

    return res.json({
      message: "Posts fetched successfully",
      posts,
    });
  } catch (error) {
    console.error("GET POSTS ERROR:", error.message);
    return res.status(500).json({ message: "Error fetching posts" });
  }
};

// ================= DELETE POST =================
exports.deletePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (String(post.author) !== String(userId)) {
      return res.status(403).json({
        message: "Not authorized to delete this post",
      });
    }

    await post.deleteOne();

    return res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("DELETE ERROR:", error.message);
    return res.status(500).json({ message: "Error deleting post" });
  }
};

// ================= TOGGLE LIKE =================
exports.toggleLike = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const likeIndex = post.likes.findIndex(
      (id) => String(id) === String(userId)
    );

    if (likeIndex >= 0) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    return res.json({
      message: likeIndex >= 0 ? "Post unliked" : "Post liked",
      likes: post.likes.length,
    });
  } catch (error) {
    console.error("LIKE ERROR:", error.message);
    return res.status(500).json({ message: "Error toggling like" });
  }
};

// ================= ADD COMMENT =================
exports.addComment = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        message: "Comment text is required",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = new Comment({
      text: text.trim(),
      author: userId,
      post: postId,
    });

    await comment.save();

    post.comments.push(comment._id);
    await post.save();

    return res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.error("COMMENT ERROR:", error.message);
    return res.status(500).json({ message: "Error adding comment" });
  }
};
