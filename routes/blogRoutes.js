const express = require("express");
const blogController = require("../controllers/blogController");

const router = express.Router();

router.get("/blog", (req, res) => {
  res.render("blog/blog");
});

router.get("/blog/lead-story", (req, res) => {
  res.render("blog/blog_lead_story");
});

router.get("/blog/my-posts", (req, res) => {
  res.render("blog/my_posts");
});

router.get("/blog/post-edit", (req, res) => {
  res.render("blog/post_edit");
});

module.exports = router;