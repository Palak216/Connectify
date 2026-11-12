const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/authmiddleware");
const validate = require("../middlewares/validate");
const { followUserParamSchema } = require("../validations/schemas");
const { followUser, unfollowUser } = require("../controllers/userController");

// Follow a user
router.post("/:id/follow", isLoggedIn, validate(followUserParamSchema), followUser);

// Unfollow a user
router.post("/:id/unfollow", isLoggedIn, validate(followUserParamSchema), unfollowUser);

module.exports = router;
