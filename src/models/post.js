const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    trim: true,
    default: ""
  },
  imageUrl: {
    type: String,
    default: null
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment"
  }]
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);