"use strict";

const express = require(
  "express",
);

const blogController =
  require(
    "../controllers/blogController",
  );

const {
  requireAuth,
} = require(
  "../middlewares/authMiddleware",
);

const router =
  express.Router();

/*
 * This router is already mounted
 * under /blog in routeConfig.js.
 */

router.get(
  "/",
  blogController.getBlogPage,
);

router.get(
  "/my-posts",
  requireAuth,
  blogController.getMyPostsPage,
);

router.get(
  "/create",
  requireAuth,
  blogController.getCreatePostPage,
);

router.post(
  "/",
  requireAuth,
  blogController.createPost,
);

router.get(
  "/:id/edit",
  requireAuth,
  blogController.getPostEditPage,
);

router.post(
  "/:id/update",
  requireAuth,
  blogController.updatePost,
);

router.post(
  "/:id/draft",
  requireAuth,
  blogController.saveDraft,
);

router.post(
  "/:id/publish",
  requireAuth,
  blogController.publishPost,
);

router.post(
  "/:id/delete",
  requireAuth,
  blogController.deletePost,
);

router.post(
  "/:id/comments",
  requireAuth,
  blogController.addComment,
);

router.post(
  "/:id/comments/:commentId/replies",
  requireAuth,
  blogController.addReply,
);

router.post(
  "/:id/comments/:commentId/like",
  requireAuth,
  blogController.toggleCommentLike,
);

router.post(
  "/:id/comments/:commentId/delete",
  requireAuth,
  blogController.deleteComment,
);

/*
 * Keep the dynamic ID route last.
 */
router.get(
  "/:id",
  blogController.getBlogViewPage,
);

module.exports = router;