"use strict";

const express = require("express");
const blogController = require("../controllers/blogController");

const router = express.Router();

/*
 * config/routeConfig.js already mounts this router at /blog.
 * Child routes below must not repeat the /blog prefix.
 */

router.get("/", blogController.getBlogPage);
router.get("/my-posts", blogController.getMyPostsPage);

/*
 * POST handlers are ready for create_post.ejs and post_edit.ejs.
 * The GET form pages can be added in the next phase.
 */
router.post("/", blogController.createPost);
router.post("/:id/update", blogController.updatePost);
router.post("/:id/draft", blogController.saveDraft);
router.post("/:id/publish", blogController.publishPost);
router.post("/:id/delete", blogController.deletePost);

router.post("/:id/comments", blogController.addComment);
router.post(
  "/:id/comments/:commentId/delete",
  blogController.deleteComment,
);

/* Keep this last so it does not capture /my-posts. */
router.get("/:id", blogController.getBlogViewPage);

module.exports = router;