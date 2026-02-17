const db = require("../config/db");

// ================= SHOW CREATE POST PAGE =================
exports.getCreatePost = (req, res) => {
  res.render("createPost");
};

// ================= CREATE POST =================
exports.createPost = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const { content } = req.body;
    const imageUrl = req.file ? req.file.path : null;
    const userId = req.session.user.id;

    await db.query(
      "INSERT INTO posts (content, image_url, user_id) VALUES (?, ?, ?)",
      [content, imageUrl, userId]
    );

    res.redirect("/feed");

  } catch (error) {
    console.error("CREATE POST ERROR:", error);
    res.status(500).send("Error creating post");
  }
};

// ================= DELETE POST =================
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.session.user.id;

    await db.query(
      "DELETE FROM posts WHERE id = ? AND user_id = ?",
      [postId, userId]
    );

    res.redirect("/feed");

  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).send("Error deleting post");
  }
};

// ================= TOGGLE LIKE =================
exports.toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.session.user.id;

    const [existing] = await db.query(
      "SELECT * FROM likes WHERE user_id = ? AND post_id = ?",
      [userId, postId]
    );

    if (existing.length > 0) {
      await db.query(
        "DELETE FROM likes WHERE user_id = ? AND post_id = ?",
        [userId, postId]
      );
    } else {
      await db.query(
        "INSERT INTO likes (user_id, post_id) VALUES (?, ?)",
        [userId, postId]
      );
    }

    res.redirect("/feed");

  } catch (err) {
    console.log("LIKE ERROR:", err);
    res.status(500).send("Error liking post");
  }
};
