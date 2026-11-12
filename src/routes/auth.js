const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authmiddleware");
const validate = require("../middlewares/validate");
const { signupSchema, loginSchema } = require("../validations/schemas");

// POST /api/auth/signup
router.post("/signup", validate(signupSchema), authController.signup);

// POST /api/auth/login
router.post("/login", validate(loginSchema), authController.login);

// POST /api/auth/logout (JWT protected)
router.post("/logout", authMiddleware, authController.logout);

module.exports = router;
