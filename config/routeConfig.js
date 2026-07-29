const express = require("express");

const homeRoutes = require("../routes/homeRoutes");
const sharedRoutes = require("../routes/sharedRoutes");
const cartRoutes = require("../routes/cartRoutes");
const blogRoutes = require("../routes/blogRoutes");
const reviewRoutes = require("../routes/reviewRoutes");
const giftcardRoutes = require("../routes/giftcardRoutes");

const router = express.Router();

router.use("/", homeRoutes);
router.use("/shared", sharedRoutes);
router.use("/cart", cartRoutes);
router.use("/blog", blogRoutes);
// Phải có dòng này
router.use("/review", reviewRoutes);
router.use("/giftcard", giftcardRoutes);

module.exports = router;