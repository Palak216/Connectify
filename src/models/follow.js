const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate follows at database level
followSchema.index({ follower: 1, following: 1 }, { unique: true });
// Optimize looking up a user's followers
followSchema.index({ following: 1 });

module.exports = mongoose.model("Follow", followSchema);
