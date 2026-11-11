const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authmiddleware");

// POST /api/auth/signup
router.post("/signup", authController.signup);

// POST /api/auth/login
router.post("/login", authController.login);

// POST /api/auth/logout (JWT protected)
router.post("/logout", authMiddleware, authController.logout);

module.exports = router;
