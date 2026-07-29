const express = require("express");
const forumController = require("../controllers/forumController");

const router = express.Router();

router.get("/", forumController.getForumHome);
router.get("/new-posts", forumController.getThreadList);
router.get("/create", forumController.getCreateThreadPage);
router.get("/category/:category", forumController.getThreadList);
router.get("/thread/:slug", forumController.getThreadContent);

module.exports = router;
