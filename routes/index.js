const express = require("express");

const homeRoutes = require("./homeRoutes");
const sharedRoutes = require("./sharedRoutes");
const cartRoutes = require("./cartRoutes");
const blogRoutes = require("./blogRoutes");
const reviewRoutes = require("./reviewRoutes");
const giftcardRoutes = require("./giftcardRoutes");

const router = express.Router();

router.use("/", homeRoutes);
router.use("/shared", sharedRoutes);
router.use("/cart", cartRoutes);
router.use("/blog", blogRoutes);
router.use("/review", reviewRoutes);
router.use("/giftcard", giftcardRoutes);

module.exports = router;