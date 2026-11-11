const express = require("express");
const router = express.Router();
const db = require("../config/db");
const isLoggedIn = require("../middlewares/authmiddleware");

router.post("/comments/:postId", isLoggedIn, async (req, res) => {
  const { text } = req.body;
  const postId = req.params.postId;
  const userId = req.session.user.id;

  await db.query(
    "INSERT INTO comments (text, user_id, post_id) VALUES (?, ?, ?)",
    [text, userId, postId]
  );

  res.redirect("/feed");
});

module.exports = router;
