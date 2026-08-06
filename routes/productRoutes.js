"use strict";

const express = require(
  "express"
);

const {
  requireAuth
} = require(
  "../middlewares/authMiddleware"
);

const {
  uploadReviewImages
} = require(
  "../middlewares/reviewImageUpload"
);

const productController = require(
  "../controllers/productController"
);

const reviewController = require(
  "../controllers/reviewController"
);

const router =
  express.Router();

router.post(
  "/:slug/reviews",
  requireAuth,
  uploadReviewImages,
  reviewController.createReview
);

router.get(
  "/:slug/reviews/:reviewId/edit",
  requireAuth,
  reviewController.showEditReviewPage
);

router.post(
  "/:slug/reviews/:reviewId/update",
  requireAuth,
  uploadReviewImages,
  reviewController.updateReview
);

router.post(
  "/:slug/reviews/:reviewId/delete",
  requireAuth,
  reviewController.deleteReview
);

router.get(
  "/:slug",
  productController.showProductDetail
);

module.exports = router;
