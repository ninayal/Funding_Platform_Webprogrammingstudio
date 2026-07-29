const reviewModel = require("../models/reviewModel");

const PRODUCT_REVIEW_PATH = "/review/product-review";
const PRODUCT_DETAIL_PATH = "/review";

const getCurrentUser = (req) => {
  if (req.session?.user?.id) {
    return {
      id: String(req.session.user.id),
      name: String(req.session.user.name || "Signed-in user")
    };
  }

  const demoUser = { id: "demo-user-1", name: "Mai T." };

  if (req.session) {
    req.session.user = demoUser;
  }

  return demoUser;
};

const cleanSingleLine = (value) =>
  String(value || "").replace(/\s+/g, " ").trim();

const cleanParagraph = (value) =>
  String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();

const isValidImagePath = (image) => {
  if (!image) return true;

  if (
    image.startsWith("/images/") ||
    image.startsWith("/uploads/")
  ) {
    return true;
  }

  try {
    const url = new URL(image);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const validateReview = (body) => {
  const values = {
    rating: Number(body.rating),
    reviewTitle: cleanSingleLine(body.reviewTitle),
    review: cleanParagraph(body.review),
    imageUrl: cleanSingleLine(body.imageUrl)
  };
  const errors = {};

  if (
    !Number.isInteger(values.rating) ||
    values.rating < 1 ||
    values.rating > 5
  ) {
    errors.rating = "Choose a rating from 1 to 5 stars.";
  }

  if (
    values.reviewTitle.length < 4 ||
    values.reviewTitle.length > 80
  ) {
    errors.reviewTitle =
      "The title must contain between 4 and 80 characters.";
  } else if (!/[\p{L}\p{N}]/u.test(values.reviewTitle)) {
    errors.reviewTitle =
      "The title must contain at least one letter or number.";
  }

  const wordCount = values.review.split(/\s+/).filter(Boolean).length;

  if (values.review.length < 10 || values.review.length > 600) {
    errors.review =
      "The review must contain between 10 and 600 characters.";
  } else if (wordCount < 3) {
    errors.review = "The review must contain at least three words.";
  }

  if (values.imageUrl.length > 500) {
    errors.imageUrl = "The image URL must not exceed 500 characters.";
  } else if (!isValidImagePath(values.imageUrl)) {
    errors.imageUrl =
      "Use an http(s) URL or a local /images/ or /uploads/ path.";
  }

  return { values, errors };
};

const getStatusMessage = (status) =>
  ({
    created: "Your review was created successfully.",
    updated: "Your review was updated successfully.",
    deleted: "Your review was deleted successfully."
  })[status] || "";

const emptyFormValues = () => ({
  rating: "",
  reviewTitle: "",
  review: "",
  imageUrl: ""
});

const safeReturnPath = (value) =>
  [PRODUCT_REVIEW_PATH, PRODUCT_DETAIL_PATH].includes(value)
    ? value
    : PRODUCT_REVIEW_PATH;

const redirectUrl = (returnPath, status) => {
  const params = new URLSearchParams({ status });

  if (returnPath === PRODUCT_DETAIL_PATH) {
    params.set("tab", "review");
  }

  return `${returnPath}?${params}#customer-reviews`;
};

const buildReviewData = (req, options = {}) => ({
  ...reviewModel.getReviewPageData(getCurrentUser(req)),
  formMode: options.formMode || "create",
  editingReviewId: options.editingReviewId || "",
  formValues: options.formValues || emptyFormValues(),
  serverErrors: options.serverErrors || {},
  pageMessage:
    options.pageMessage || getStatusMessage(req.query.status),
  pageStatus: req.query.status || "",
  reviewDateValue: new Date().toISOString().slice(0, 10),
  returnPath: options.returnPath || PRODUCT_REVIEW_PATH
});

const renderProductReview = (req, res, options = {}) =>
  res
    .status(options.statusCode || 200)
    .render("review/product_review", buildReviewData(req, options));

const renderProductDetail = (req, res, options = {}) => {
  const detailData = reviewModel.getProductDetailPageData();
  const openReview =
    options.openReviewTab ||
    req.query.tab === "review" ||
    Boolean(req.query.status);

  detailData.tabs = detailData.tabs.map((tab) => ({
    ...tab,
    isDefault: openReview
      ? tab.id === "review"
      : tab.id === "description"
  }));

  return res
    .status(options.statusCode || 200)
    .render("review/review", {
      ...detailData,
      ...buildReviewData(req, {
        ...options,
        returnPath: PRODUCT_DETAIL_PATH
      })
    });
};

const showProductReviewPage = (req, res, next) => {
  try {
    return renderProductReview(req, res);
  } catch (error) {
    return next(error);
  }
};

const createReview = (req, res, next) => {
  try {
    const currentUser = getCurrentUser(req);
    const returnPath = safeReturnPath(req.body.returnPath);
    const { values, errors } = validateReview(req.body);

    if (Object.keys(errors).length) {
      const options = {
        statusCode: 422,
        formValues: values,
        serverErrors: errors,
        pageMessage:
          "Correct the highlighted fields before submitting.",
        returnPath,
        openReviewTab: true
      };

      return returnPath === PRODUCT_DETAIL_PATH
        ? renderProductDetail(req, res, options)
        : renderProductReview(req, res, options);
    }

    reviewModel.createReview({
      userId: currentUser.id,
      name: currentUser.name,
      rating: values.rating,
      title: values.reviewTitle,
      comment: values.review,
      image: values.imageUrl
    });

    return res.redirect(redirectUrl(returnPath, "created"));
  } catch (error) {
    return next(error);
  }
};

const showEditReviewPage = (req, res, next) => {
  try {
    const currentUser = getCurrentUser(req);
    const review = reviewModel.getReviewById(req.params.reviewId);

    if (!review) {
      return res.status(404).send("Review not found.");
    }

    if (review.userId !== currentUser.id) {
      return res
        .status(403)
        .send("You may only edit your own review.");
    }

    return renderProductReview(req, res, {
      formMode: "edit",
      editingReviewId: review.id,
      formValues: {
        rating: review.rating,
        reviewTitle: review.title,
        review: review.comment,
        imageUrl: review.image
      },
      pageMessage: "You are editing your review.",
      returnPath: safeReturnPath(req.query.returnPath)
    });
  } catch (error) {
    return next(error);
  }
};

const updateReview = (req, res, next) => {
  try {
    const currentUser = getCurrentUser(req);
    const existing =
      reviewModel.getReviewById(req.params.reviewId);
    const returnPath = safeReturnPath(req.body.returnPath);

    if (!existing) {
      return res.status(404).send("Review not found.");
    }

    if (existing.userId !== currentUser.id) {
      return res
        .status(403)
        .send("You may only update your own review.");
    }

    const { values, errors } = validateReview(req.body);

    if (Object.keys(errors).length) {
      return renderProductReview(req, res, {
        statusCode: 422,
        formMode: "edit",
        editingReviewId: existing.id,
        formValues: values,
        serverErrors: errors,
        pageMessage:
          "Correct the highlighted fields before updating.",
        returnPath
      });
    }

    reviewModel.updateReview(existing.id, currentUser.id, {
      rating: values.rating,
      title: values.reviewTitle,
      comment: values.review,
      image: values.imageUrl
    });

    return res.redirect(redirectUrl(returnPath, "updated"));
  } catch (error) {
    return next(error);
  }
};

const deleteReview = (req, res, next) => {
  try {
    const currentUser = getCurrentUser(req);
    const returnPath = safeReturnPath(req.body.returnPath);
    const result = reviewModel.deleteReview(
      req.params.reviewId,
      currentUser.id
    );

    if (result.status === "not-found") {
      return res.status(404).send("Review not found.");
    }

    if (result.status === "forbidden") {
      return res
        .status(403)
        .send("You may only delete your own review.");
    }

    return res.redirect(redirectUrl(returnPath, "deleted"));
  } catch (error) {
    return next(error);
  }
};

const showReviewDetailPage = (req, res, next) => {
  try {
    return renderProductDetail(req, res);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createReview,
  deleteReview,
  showEditReviewPage,
  showProductReviewPage,
  showReviewDetailPage,
  updateReview
};
