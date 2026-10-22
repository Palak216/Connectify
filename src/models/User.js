const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 160,
    default: "",
  },
  profileImageUrl: {
    type: String,
    default: "",
  },
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
}, { timestamps: true });

userSchema.index({ username: 1 });

module.exports = mongoose.model("User", userSchema);
