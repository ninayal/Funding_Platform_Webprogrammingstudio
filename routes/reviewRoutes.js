const express = require("express");
const reviewController = require("../controllers/reviewController");

const router = express.Router();

// Trang tổng hợp review
router.get(
  "/product-review",
  reviewController.showProductReviewPage
);

// Tạo review
router.post(
  "/reviews",
  reviewController.createReview
);

// Mở form edit review
router.get(
  "/reviews/:reviewId/edit",
  reviewController.showEditReviewPage
);

// Cập nhật review
router.post(
  "/reviews/:reviewId/update",
  reviewController.updateReview
);

// Xóa review
router.post(
  "/reviews/:reviewId/delete",
  reviewController.deleteReview
);

// Trang chi tiết sản phẩm review1, review2,...
router.get(
  "/product_detail/review:reviewNumber",
  reviewController.showReviewDetailPage
);

module.exports = router;