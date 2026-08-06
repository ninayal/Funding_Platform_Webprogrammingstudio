"use strict";

const express = require("express");

const blogController = require(
  "../controllers/blogController",
);

const router = express.Router();
router.get(
  "/",
  blogController.getBlogPage,
);

router.get(
  "/my-posts",
  blogController.getMyPostsPage,
);

router.get(
  "/create",
  blogController.getCreatePostPage,
);

router.post(
  "/",
  blogController.createPost,
);

router.get(
  "/:id/edit",
  blogController.getPostEditPage,
);

router.post(
  "/:id/update",
  blogController.updatePost,
);

router.post(
  "/:id/delete",
  blogController.deletePost,
);

router.post(
  "/:id/comments",
  blogController.addComment,
);

router.post(
  "/:id/comments/:commentId/replies",
  blogController.addReply,
);

router.post(
  "/:id/comments/:commentId/like",
  blogController.toggleCommentLike,
);

router.post(
  "/:id/comments/:commentId/delete",
  blogController.deleteComment,
);

router.get(
  "/:id",
  blogController.getBlogViewPage,
);

module.exports = router;