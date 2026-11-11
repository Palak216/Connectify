const mongoose = require("mongoose");
const User = require("../models/User");
const Follow = require("../models/follow");
const Notification = require("../models/notification");
const { emitNotification } = require("../socket");

// ================= FOLLOW USER =================
exports.followUser = async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const currentUserId = req.user.id;

    if (!mongoose.isValidObjectId(targetUserId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (String(currentUserId) === String(targetUserId)) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingFollow = await Follow.findOne({
      follower: currentUserId,
      following: targetUserId,
    });

    if (existingFollow) {
      return res.status(400).json({ message: "Already following this user" });
    }

    const follow = new Follow({
      follower: currentUserId,
      following: targetUserId,
    });
    await follow.save();

    // Create and emit notification if actor is not recipient
    if (String(currentUserId) !== String(targetUserId)) {
      try {
        const notification = new Notification({
          recipient: targetUserId,
          actor: currentUserId,
          type: "follow",
        });
        await notification.save();
        await notification.populate("actor", "username");
        emitNotification(targetUserId, notification);
      } catch (notifErr) {
        console.error("NOTIFICATION ERROR:", notifErr.message);
      }
    }

    return res.status(201).json({
      message: "Successfully followed user",
      follow,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Already following this user" });
    }
    console.error("FOLLOW ERROR:", error.message);
    return res.status(500).json({ message: "Error following user" });
  }
};

// ================= UNFOLLOW USER =================
exports.unfollowUser = async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const currentUserId = req.user.id;

    if (!mongoose.isValidObjectId(targetUserId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (String(currentUserId) === String(targetUserId)) {
      return res.status(400).json({ message: "You cannot unfollow yourself" });
    }

    const follow = await Follow.findOneAndDelete({
      follower: currentUserId,
      following: targetUserId,
    });

    if (!follow) {
      return res.status(400).json({ message: "You are not following this user" });
    }

    return res.status(200).json({
      message: "Successfully unfollowed user",
    });
  } catch (error) {
    console.error("UNFOLLOW ERROR:", error.message);
    return res.status(500).json({ message: "Error unfollowing user" });
  }
};
