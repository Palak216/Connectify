const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/db");

// ------------------
// Pages
// ------------------

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/register", (req, res) => {
  res.render("register");
});

// ------------------
// Register
// ------------------

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email.trim(), hashedPassword]
    );

    res.redirect("/login");

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.send("Registration failed");
  }
});

// ------------------
// Login
// ------------------

router.post("/login", async (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password;

  const [rows] = await db.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (rows.length === 0) {
    return res.send("User not found");
  }

  const user = rows[0];

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.send("Invalid password");
  }

  req.session.user = {
    id: user.id,
    username: user.username,
    email: user.email
  };

  res.redirect("/feed");
});

module.exports = router;
