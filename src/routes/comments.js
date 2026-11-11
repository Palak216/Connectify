const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/authmiddleware");
const validate = require("../middlewares/validate");
const { commentIdParamSchema } = require("../validations/schemas");
const { deleteComment } = require("../controllers/postController");

// Delete a comment (author only)
router.delete("/:id", isLoggedIn, validate(commentIdParamSchema), deleteComment);

module.exports = router;
