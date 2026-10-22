const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/post");

function publicUser(user) {
  return { id: user._id, username: user.username, bio: user.bio || "", profileImageUrl: user.profileImageUrl || "", followersCount: user.followers?.length || 0, followingCount: user.following?.length || 0, createdAt: user.createdAt };
}

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").populate("followers", "username profileImageUrl").populate("following", "username profileImageUrl");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user: publicUser(user), followers: user.followers, following: user.following });
  } catch (error) { console.error("Profile fetch failed:", error.name || "Error"); return res.status(500).json({ message: "Could not load profile" }); }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const updates = {};
    if (typeof req.body.bio === "string") { const bio = req.body.bio.trim(); if (bio.length > 160) return res.status(400).json({ message: "Bio must be 160 characters or fewer" }); updates.bio = bio; }
    if (typeof req.body.profileImageUrl === "string") { const url = req.body.profileImageUrl.trim(); if (url && !url.startsWith("https://")) return res.status(400).json({ message: "Profile image must be an HTTPS URL" }); if (url.length > 2048) return res.status(400).json({ message: "Profile image URL is too long" }); updates.profileImageUrl = url; }
    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true, runValidators: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "Profile updated", user: publicUser(user) });
  } catch (error) { console.error("Profile update failed:", error.name || "Error"); return res.status(500).json({ message: "Could not update profile" }); }
};

exports.discoverUsers = async (req, res) => {
  try {
    const search = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 40) : "";
    const filter = { _id: { $ne: req.user.id } };
    if (search) filter.username = { $regex: search, $options: "i" };
    const users = await User.find(filter).select("username bio profileImageUrl followers following createdAt").sort({ username: 1 }).limit(30);
    return res.json({ users: users.map(publicUser) });
  } catch (error) { console.error("User discovery failed:", error.name || "Error"); return res.status(500).json({ message: "Could not discover users" }); }
};

exports.getUserProfile = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid user ID" });
    const user = await User.findById(req.params.id).select("username bio profileImageUrl followers following createdAt");
    if (!user) return res.status(404).json({ message: "User not found" });
    const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 }).populate("author", "username profileImageUrl");
    return res.json({ user: publicUser(user), posts });
  } catch (error) { console.error("User profile fetch failed:", error.name || "Error"); return res.status(500).json({ message: "Could not load user profile" }); }
};

exports.toggleFollow = async (req, res) => {
  const targetId = req.params.id;
  const currentId = req.user.id;
  if (targetId === currentId) return res.status(400).json({ message: "You cannot follow yourself" });
  if (!mongoose.isValidObjectId(targetId)) return res.status(400).json({ message: "Invalid user ID" });
  const session = await mongoose.startSession();
  try {
    let following;
    await session.withTransaction(async () => {
      const [current, target] = await Promise.all([User.findById(currentId).session(session), User.findById(targetId).session(session)]);
      if (!current || !target) throw Object.assign(new Error("User not found"), { statusCode: 404 });
      const alreadyFollowing = current.following.some((id) => id.toString() === targetId);
      if (alreadyFollowing) { current.following.pull(target._id); target.followers.pull(current._id); following = false; }
      else { current.following.addToSet(target._id); target.followers.addToSet(current._id); following = true; }
      await Promise.all([current.save({ session }), target.save({ session })]);
    });
    return res.json({ following, message: following ? "User followed" : "User unfollowed" });
  } catch (error) {
    if (error.statusCode === 404) return res.status(404).json({ message: error.message });
    console.error("Follow update failed:", error.name || "Error");
    return res.status(500).json({ message: "Could not update follow" });
  } finally { await session.endSession(); }
};
