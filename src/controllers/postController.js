
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
  ? req.file.path.startsWith("http")
    ? req.file.path
    : `/uploads/${req.file.filename}`
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

    const postExists = await Post.findById(postId);
    if (!postExists) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Atomically unlike if user already liked
    const unlikedPost = await Post.findOneAndUpdate(
      { _id: postId, likes: userId },
      { $pull: { likes: userId } },
      { new: true }
    );

    if (unlikedPost) {
      return res.json({
        message: "Post unliked",
        likes: unlikedPost.likes.length,
      });
    }

    // Otherwise atomically add user to likes ($addToSet guarantees uniqueness)
    const likedPost = await Post.findOneAndUpdate(
      { _id: postId },
      { $addToSet: { likes: userId } },
      { new: true }
    );

    return res.json({
      message: "Post liked",
      likes: likedPost.likes.length,
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
