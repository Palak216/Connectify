const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  { timestamps: true }
);

// Compound index to optimize fetching comments for a post sorted by createdAt
commentSchema.index({ post: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);
