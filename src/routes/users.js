const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/authmiddleware");
const { followUser, unfollowUser } = require("../controllers/userController");

// Follow a user
router.post("/:id/follow", isLoggedIn, followUser);

// Unfollow a user
router.post("/:id/unfollow", isLoggedIn, unfollowUser);

module.exports = router;
