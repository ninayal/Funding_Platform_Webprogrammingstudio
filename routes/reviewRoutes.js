const express = require("express");
const reviewController = require("../controllers/reviewController");

const router = express.Router();

router.get("/product-review", reviewController.getProductReviewPage);

router.get(
  "/review/:reviewNumber",
    reviewController.getReviewDetailPage
);

module.exports = router;