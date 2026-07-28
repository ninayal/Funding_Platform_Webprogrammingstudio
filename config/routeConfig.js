const express = require("express");

const homeRoutes = require("../routes/homeRoutes");
const sharedRoutes = require("../routes/sharedRoutes");
const cartRoutes = require("../routes/cartRoutes");
const blogRoutes = require("../routes/blogRoutes");
const reviewRoutes = require("../routes/reviewRoutes");
const giftcardRoutes = require("../routes/giftcardRoutes");

const router = express.Router();

/*
 * Top-level application modules.
 *
 * This file only decides which large module owns each URL prefix.
 * The child pages and actions inside each module remain in its own
 * routes/<module>Routes.js file.
 */

router.use("/", homeRoutes);
router.use("/shared", sharedRoutes);
router.use("/cart", cartRoutes);
router.use("/blog", blogRoutes);
router.use("/review", reviewRoutes);
router.use("/giftcard", giftcardRoutes);

module.exports = router;
