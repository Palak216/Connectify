const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// POST /api/auth/signup
router.post("/signup", authController.signup);

// POST /api/auth/login
router.post("/login", authController.login);
// Logout (JWT-based authentication)
router.post("/logout", (req, res) => {
  return res.status(200).json({
    message: "Logged out successfully",
  });
});



module.exports = router;