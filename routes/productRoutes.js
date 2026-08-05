"use strict";

const express = require("express");

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

const router = express.Router();

/*
 * TEMPORARY REVIEW TEST USER
 * Change to false or delete this block
 * after the real login flow is connected.
 */
const ENABLE_REVIEW_TEST_USER = true;

const attachReviewTestUser = (
  req,
  res,
  next
) => {
  if (!ENABLE_REVIEW_TEST_USER) {
    return next();
  }

  const testUser = {
    id: "review-test-user",
    name: "Review Test User",
    email:
      "review.test@example.com"
  };

  if (req.session) {
    req.session.user = testUser;
  }

  req.currentUser = testUser;
  res.locals.currentUser =
    testUser;

  return next();
};

router.use(
  attachReviewTestUser
);

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
