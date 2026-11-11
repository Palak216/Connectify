const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      trim: true,
      default: "",
    },
    imageUrl: {
      type: String,
      default: null,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

// Compound indexes for user posts and feed queries sorted newest first
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
