const express = require("express");
const reviewController = require("../controllers/reviewController");

const router = express.Router();

// GET /review
router.get("/", reviewController.showReviewDetailPage);

// GET /review/product-review
router.get(
  "/product-review",
  reviewController.showProductReviewPage
);

router.post(
  "/reviews",
  reviewController.createReview
);

router.get(
  "/reviews/:reviewId/edit",
  reviewController.showEditReviewPage
);

router.post(
  "/reviews/:reviewId/update",
  reviewController.updateReview
);

router.post(
  "/reviews/:reviewId/delete",
  reviewController.deleteReview
);

// URL cũ
router.get("/product_detail/review1", (req, res) => {
  return res.redirect("/review");
});

module.exports = router;