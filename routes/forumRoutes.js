const express = require("express");
const forumController = require("../controllers/forumController");
const { requireAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", forumController.getForumHome);
router.get("/new-posts", forumController.getThreadList);
router.get("/search", forumController.searchForum);
router.get("/your-posts", requireAuth, forumController.getYourPostsPage);
router.get("/bookmarked", requireAuth, forumController.getBookmarkedPage);
router.get("/create", requireAuth, forumController.getCreateThreadPage);
router.post("/create", requireAuth, forumController.createThread);
router.get("/category/:category", forumController.getThreadList);
router.get("/thread/:slug", forumController.getThreadContent);
router.post("/thread/:slug/publish", requireAuth, forumController.publishThread);
router.post("/thread/:slug/post/:postId/like", requireAuth, forumController.toggleLike);
router.post("/thread/:slug/post/:postId/dislike", requireAuth, forumController.toggleDislike);
router.post("/thread/:slug/post/:postId/bookmark", requireAuth, forumController.toggleBookmark);

module.exports = router;
