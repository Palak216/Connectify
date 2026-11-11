const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/authmiddleware");
const { deleteComment } = require("../controllers/postController");

// Delete a comment (author only)
router.delete("/:id", isLoggedIn, deleteComment);

module.exports = router;
