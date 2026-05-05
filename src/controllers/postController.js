const Post = require("../models/post");
const Comment = require("../models/comment");

// ================= CREATE POST =================
exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const imageUrl = req.file ? req.file.path : null;
    const userId = req.user.id;

    const newPost = new Post({
      content,
      imageUrl,
      author: userId
    });

    await newPost.save();

    res.status(201).json({
      message: "Post created successfully",
      post: newPost
    });

  } catch (error) {
    console.error("CREATE POST ERROR:", error);
    res.status(500).json({ message: "Error creating post" });
  }
};

// ================= GET ALL POSTS =================
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username" }
      })
      .sort({ createdAt: -1 });

    res.json({
      message: "Posts fetched successfully",
      posts
    });
  } catch (error) {
    console.error("GET POSTS ERROR:", error);
    res.status(500).json({ message: "Error fetching posts" });
  }
};

// ================= DELETE POST =================
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user owns post
    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Error deleting post" });
  }
};

// ================= TOGGLE LIKE =================
exports.toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex > -1) {
      // User already liked it, so unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like the post
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      message: likeIndex > -1 ? "Post unliked" : "Post liked",
      likes: post.likes.length
    });

  } catch (err) {
    console.error("LIKE ERROR:", err);
    res.status(500).json({ message: "Error toggling like" });
  }
};

// ================= ADD COMMENT =================
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user.id;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = new Comment({
      text,
      author: userId,
      post: postId
    });

    await comment.save();

    // Add comment to post's array
    post.comments.push(comment._id);
    await post.save();

    res.status(201).json({
      message: "Comment added successfully",
      comment
    });

  } catch (err) {
    console.error("COMMENT ERROR:", err);
    res.status(500).json({ message: "Error adding comment" });
  }
};

