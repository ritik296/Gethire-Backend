const express = require("express");
const router = express.Router();
const upload = require("../Middleware/multer");
const {
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogs,
  toggleLike,
  addComment,
  deleteComment,
} = require("../Controllers/BlogController");

router.get("/getone/:id", getBlog);
router.get("/all", getBlogs);
router.post("/", upload.fields([{ name: "image" }]), createBlog);
router.put("/:id", upload.fields([{ name: "image" }]), updateBlog);
router.delete("/:id", deleteBlog);

// Like comments

router.get("/like/:blogId/:studentId", toggleLike);
router.post("/comment/:blogId/:studentId", addComment);
router.delete("/comment/:blogId/:studentId", deleteComment);

module.exports = router;
