const express = require("express");
const router = express.Router();
const multer = require("multer");

const postController = require("../controllers/postController");
console.log("POST CONTROLLER:", postController);

const isLoggedIn = require("../middlewares/authmiddleware");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.get("/post", isLoggedIn, postController.getCreatePost);

router.post("/post", isLoggedIn, upload.single("image"), postController.createPost);

router.get("/feed", isLoggedIn, postController.getFeed);

router.post("/delete/:id", isLoggedIn, postController.deletePost);

router.post("/like/:id", isLoggedIn, postController.toggleLike);

module.exports=router;