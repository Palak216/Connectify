const db = require("../config/db");

exports.getFeed = async (req, res) => {
  try {
    const [posts] = await db.query(`
      SELECT posts.*, users.username,
      COUNT(likes.id) AS like_count
      FROM posts
      JOIN users ON posts.user_id = users.id
      LEFT JOIN likes ON likes.post_id = posts.id
      GROUP BY posts.id
      ORDER BY posts.created_at DESC
    `);

    res.render("feed", {
      posts,
      user: req.session.user
    });

  } catch (err) {
    console.log("FEED ERROR:", err);
    res.status(500).send("Error loading feed");
  }
};
