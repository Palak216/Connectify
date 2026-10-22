const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/authmiddleware");
const {
  getMyProfile,
  updateMyProfile,
  discoverUsers,
  getUserProfile,
  toggleFollow,
} = require("../controllers/userController");

router.get("/me", isLoggedIn, getMyProfile);
router.patch("/me", isLoggedIn, updateMyProfile);
router.get("/discover", isLoggedIn, discoverUsers);
router.get("/:id", isLoggedIn, getUserProfile);
router.post("/:id/follow", isLoggedIn, toggleFollow);

module.exports = router;
