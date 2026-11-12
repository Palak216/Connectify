
const mongoose = require("mongoose");
const Post = require("../models/post");
const Comment = require("../models/comment");
const Follow = require("../models/follow");
const Notification = require("../models/notification");
const { emitNotification } = require("../socket");

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
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const totalPosts = await Post.countDocuments();
    const posts = await Post.find()
      .populate("author", "username")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      message: "Posts fetched successfully",
      posts,
      page,
      limit,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
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
      { returnDocument: "after" }
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
      { returnDocument: "after" }
    );

    // Create and emit notification if actor is not the post author
    if (String(likedPost.author) !== String(userId)) {
      try {
        const notification = new Notification({
          recipient: likedPost.author,
          actor: userId,
          type: "like",
          post: postId,
        });
        await notification.save();
        await notification.populate("actor", "username");
        emitNotification(likedPost.author, notification);
      } catch (notifErr) {
        console.error("NOTIFICATION ERROR:", notifErr.message);
      }
    }

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

    // Create and emit notification if actor is not the post author
    if (String(post.author) !== String(userId)) {
      try {
        const notification = new Notification({
          recipient: post.author,
          actor: userId,
          type: "comment",
          post: postId,
        });
        await notification.save();
        await notification.populate("actor", "username");
        emitNotification(post.author, notification);
      } catch (notifErr) {
        console.error("NOTIFICATION ERROR:", notifErr.message);
      }
    }

    return res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.error("COMMENT ERROR:", error.message);
    return res.status(500).json({ message: "Error adding comment" });
  }
};

// ================= GET COMMENTS (PAGINATED) =================
exports.getComments = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const totalComments = await Comment.countDocuments({ post: postId });
    const comments = await Comment.find({ post: postId })
      .populate("author", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      comments,
      page,
      limit,
      totalPages: Math.ceil(totalComments / limit),
      totalComments,
    });
  } catch (error) {
    console.error("GET COMMENTS ERROR:", error.message);
    return res.status(500).json({ message: "Error fetching comments" });
  }
};

// ================= DELETE COMMENT (AUTHOR ONLY) =================
exports.deleteComment = async (req, res) => {
  try {
    const { id: commentId } = req.params;
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (String(comment.author) !== String(userId)) {
      return res.status(403).json({
        message: "Not authorized to delete this comment",
      });
    }

    await comment.deleteOne();
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id },
    });

    return res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("DELETE COMMENT ERROR:", error.message);
    return res.status(500).json({ message: "Error deleting comment" });
  }
};

// ================= GET FEED (CURSOR-BASED PAGINATION) =================
exports.getFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const { cursor } = req.query;

    const followingDocs = await Follow.find({ follower: userId }).select("following");
    const followingIds = followingDocs.map((doc) => doc.following);

    if (followingIds.length === 0) {
      return res.json({
        posts: [],
        nextCursor: null,
        hasMore: false,
      });
    }

    const filter = { author: { $in: followingIds } };

    if (cursor) {
      const cursorDate = new Date(cursor);
      if (isNaN(cursorDate.getTime())) {
        return res.status(400).json({ message: "Invalid cursor format" });
      }
      filter.createdAt = { $lt: cursorDate };
    }

    const posts = await Post.find(filter)
      .populate("author", "username")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username" },
      })
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = posts.length > limit;
    const feedPosts = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor =
      hasMore && feedPosts.length > 0
        ? feedPosts[feedPosts.length - 1].createdAt.toISOString()
        : null;

    return res.json({
      posts: feedPosts,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("FEED ERROR:", error.message);
    return res.status(500).json({ message: "Error fetching feed" });
  }
};
