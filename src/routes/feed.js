const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middlewares/authmiddleware");
const { getFeed } = require("../controllers/feedController");

router.get("/feed", isLoggedIn, getFeed);

module.exports = router;
