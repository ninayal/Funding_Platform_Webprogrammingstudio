const express = require("express");
const forumController = require("../controllers/forumController");
const forumModel = require("../models/forumModel");
const { requireAuth } = require("../middlewares/authMiddleware");
const requireAdmin = require("../middlewares/requireAdmin");

const router = express.Router();

router.use((req, res, next) => {
  res.locals.forumUnreadCount = req.currentUser
    ? forumModel.getUnreadCount(req.currentUser.id)
    : 0;
  res.locals.isForumAdmin = Boolean(
    req.currentUser && String(req.currentUser.role || "").toLowerCase() === "admin"
  );
  next();
});

router.get("/", forumController.getForumHome);
router.get("/new-posts", forumController.getThreadList);
router.get("/search", forumController.searchForum);
router.get("/your-posts", requireAuth, forumController.getYourPostsPage);
router.get("/bookmarked", requireAuth, forumController.getBookmarkedPage);
router.get("/notifications", requireAuth, forumController.getNotificationsPage);
router.get("/create", requireAuth, forumController.getCreateThreadPage);
router.post("/create", requireAuth, forumController.createThread);

router.get("/admin", requireAdmin, forumController.getAdminModerationPage);
router.post("/admin/thread/:slug/:action", requireAdmin, forumController.moderateThread);
router.post("/admin/report/:id/:status", requireAdmin, forumController.resolveReport);

router.get("/category/:category", forumController.getThreadList);
router.get("/user/:userId", forumController.getUserProfilePage);

router.get("/thread/:slug/edit", requireAuth, forumController.getEditThreadPage);
router.post("/thread/:slug/edit", requireAuth, forumController.editThread);
router.post("/thread/:slug/delete", requireAuth, forumController.deleteThread);
router.get("/thread/:slug", forumController.getThreadContent);
router.post("/thread/:slug/reply", requireAuth, forumController.replyToThread);
router.post("/thread/:slug/publish", requireAuth, forumController.publishThread);
router.get("/thread/:slug/post/:postId/edit", requireAuth, forumController.getEditPostPage);
router.post("/thread/:slug/post/:postId/edit", requireAuth, forumController.editPost);
router.post("/thread/:slug/post/:postId/delete", requireAuth, forumController.deletePost);
router.post("/thread/:slug/post/:postId/report", requireAuth, forumController.reportPost);
router.get("/thread/:slug/post/:postId/quote", forumController.getPostPreview);
router.post("/thread/:slug/post/:postId/like", requireAuth, forumController.toggleLike);
router.post("/thread/:slug/post/:postId/dislike", requireAuth, forumController.toggleDislike);
router.post("/thread/:slug/post/:postId/bookmark", requireAuth, forumController.toggleBookmark);

module.exports = router;
