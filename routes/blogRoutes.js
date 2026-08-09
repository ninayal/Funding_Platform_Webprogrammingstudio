"use strict";

const express = require(
  "express"
);

const blogController = require(
  "../controllers/blogController"
);

const {
  requireAuth,
} = require(
  "../middlewares/authMiddleware"
);

const router =
  express.Router();

/*
 * PUBLIC
 * Anyone can see the Journal.
 */
router.get(
  "/",
  blogController.getBlogPage
);

/*
 * REGISTERED ACCOUNT ONLY
 */
router.get(
  "/my-posts",
  requireAuth,
  blogController.getMyPostsPage
);

/*
 * CREATE
 */
router.get(
  "/create",
  requireAuth,
  blogController.getCreatePostPage
);

router.post(
  "/",
  requireAuth,
  blogController.createPost
);

/*
 * EDIT / UPDATE / DELETE
 */
router.get(
  "/:id/edit",
  requireAuth,
  blogController.getPostEditPage
);

router.post(
  "/:id/update",
  requireAuth,
  blogController.updatePost
);

router.post(
  "/:id/delete",
  requireAuth,
  blogController.deletePost
);

/*
 * COMMENTS
 */
router.post(
  "/:id/comments",
  requireAuth,
  blogController.addComment
);

router.post(
  "/:id/comments/:commentId/replies",
  requireAuth,
  blogController.addReply
);

router.post(
  "/:id/comments/:commentId/like",
  requireAuth,
  blogController.toggleCommentLike
);

router.post(
  "/:id/comments/:commentId/delete",
  requireAuth,
  blogController.deleteComment
);

/*
 * PUBLIC POST DETAIL
 *
 * Keep this route LAST because
 * :id is dynamic.
 */
router.get(
  "/:id",
  blogController.getBlogViewPage
);

module.exports =
  router;