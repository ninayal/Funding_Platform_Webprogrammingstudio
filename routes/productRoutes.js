"use strict";

const express = require("express");

const productController = require(
  "../controllers/productController"
);

const reviewController = require(
  "../controllers/reviewController"
);

const router = express.Router();

router.post(
  "/:slug/reviews",
  reviewController.createReview
);

router.get(
  "/:slug/reviews/:reviewId/edit",
  reviewController.showEditReviewPage
);

router.post(
  "/:slug/reviews/:reviewId/update",
  reviewController.updateReview
);

router.post(
  "/:slug/reviews/:reviewId/delete",
  reviewController.deleteReview
);

router.get(
  "/:slug",
  productController.showProductDetail
);

module.exports = router;
