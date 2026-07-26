const getProductReviewPage = (req, res) => {
  res.render("review/product_review");
};

const getReviewDetailPage = (req, res) => {
  const reviewNumber = req.params.reviewNumber;

  res.render(`review/product_detail/review${reviewNumber}`);
};

module.exports = {
  getProductReviewPage,
  getReviewDetailPage,
};