const reviewModel = require("../models/reviewModel");

const getCurrentUser = (req) => {
  if (req.session?.user?.id) {
    return {
      id: String(req.session.user.id),
      name: String(req.session.user.name || "Signed-in user")
    };
  }

  // Prototype fallback. Replace this with the shared authentication user later.
  const demoUser = {
    id: "demo-user-1",
    name: "Mai T."
  };

  if (req.session) {
    req.session.user = demoUser;
  }

  return demoUser;
};

const cleanSingleLine = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim();

const cleanParagraph = (value) =>
  String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();

const isValidImagePath = (image) => {
  if (!image) {
    return true;
  }

  if (image.startsWith("/images/") || image.startsWith("/uploads/")) {
    return true;
  }

  try {
    const parsedUrl = new URL(image);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
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

  if (!Number.isInteger(values.rating) || values.rating < 1 || values.rating > 5) {
    errors.rating = "Choose a rating from 1 to 5 stars.";
  }

  if (values.reviewTitle.length < 4 || values.reviewTitle.length > 80) {
    errors.reviewTitle = "The title must contain between 4 and 80 characters.";
  } else if (!/[\p{L}\p{N}]/u.test(values.reviewTitle)) {
    errors.reviewTitle = "The title must contain at least one letter or number.";
  }

  const reviewWordCount = values.review.split(/\s+/).filter(Boolean).length;

  if (values.review.length < 10 || values.review.length > 600) {
    errors.review = "The review must contain between 10 and 600 characters.";
  } else if (reviewWordCount < 3) {
    errors.review = "The review must contain at least three words.";
  }

  if (values.imageUrl.length > 500) {
    errors.imageUrl = "The image URL must not exceed 500 characters.";
  } else if (!isValidImagePath(values.imageUrl)) {
    errors.imageUrl =
      "Use an http(s) URL or a local path beginning with /images/ or /uploads/.";
  }

  return { values, errors };
};

const getStatusMessage = (status) => {
  const messages = {
    created: "Your review was created successfully.",
    updated: "Your review was updated successfully.",
    deleted: "Your review was deleted successfully."
  };

  return messages[status] || "";
};

const renderProductReview = (req, res, options = {}) => {
  const currentUser = getCurrentUser(req);
  const pageData = reviewModel.getReviewPageData(currentUser);

  return res.status(options.statusCode || 200).render("review/product_review", {
    ...pageData,
    formMode: options.formMode || "create",
    editingReviewId: options.editingReviewId || "",
    formValues: options.formValues || {
      rating: "",
      reviewTitle: "",
      review: "",
      imageUrl: ""
    },
    serverErrors: options.serverErrors || {},
    pageMessage: options.pageMessage || getStatusMessage(req.query.status),
    pageStatus: req.query.status || "",
    reviewDateValue: new Date().toISOString().slice(0, 10)
  });
};

// GET button/page action: display all reviews.
const showProductReviewPage = (req, res, next) => {
  try {
    return renderProductReview(req, res);
  } catch (error) {
    return next(error);
  }
};

// POST button action: create a new review.
const createReview = (req, res, next) => {
  try {
    const currentUser = getCurrentUser(req);
    const validation = validateReview(req.body);

    if (Object.keys(validation.errors).length > 0) {
      return renderProductReview(req, res, {
        statusCode: 422,
        formValues: validation.values,
        serverErrors: validation.errors,
        pageMessage: "Correct the highlighted fields before submitting."
      });
    }

    reviewModel.createReview({
      userId: currentUser.id,
      name: currentUser.name,
      rating: validation.values.rating,
      title: validation.values.reviewTitle,
      comment: validation.values.review,
      image: validation.values.imageUrl
    });

    return res.redirect("/review/product-review?status=created#customer-reviews");
  } catch (error) {
    return next(error);
  }
};

// GET button action: load the logged-in user's review into the edit form.
const showEditReviewPage = (req, res, next) => {
  try {
    const currentUser = getCurrentUser(req);
    const review = reviewModel.getReviewById(req.params.reviewId);

    if (!review) {
      return res.status(404).send("Review not found.");
    }

    if (review.userId !== currentUser.id) {
      return res.status(403).send("You may only edit your own review.");
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
      pageMessage: "You are editing your review."
    });
  } catch (error) {
    return next(error);
  }
};

// POST button action: update the logged-in user's review.
const updateReview = (req, res, next) => {
  try {
    const currentUser = getCurrentUser(req);
    const existingReview = reviewModel.getReviewById(req.params.reviewId);

    if (!existingReview) {
      return res.status(404).send("Review not found.");
    }

    if (existingReview.userId !== currentUser.id) {
      return res.status(403).send("You may only update your own review.");
    }

    const validation = validateReview(req.body);

    if (Object.keys(validation.errors).length > 0) {
      return renderProductReview(req, res, {
        statusCode: 422,
        formMode: "edit",
        editingReviewId: existingReview.id,
        formValues: validation.values,
        serverErrors: validation.errors,
        pageMessage: "Correct the highlighted fields before updating."
      });
    }

    const result = reviewModel.updateReview(
      existingReview.id,
      currentUser.id,
      {
        rating: validation.values.rating,
        title: validation.values.reviewTitle,
        comment: validation.values.review,
        image: validation.values.imageUrl
      }
    );

    if (result.status === "forbidden") {
      return res.status(403).send("You may only update your own review.");
    }

    return res.redirect("/review/product-review?status=updated#customer-reviews");
  } catch (error) {
    return next(error);
  }
};

// POST button action: delete the logged-in user's review.
const deleteReview = (req, res, next) => {
  try {
    const currentUser = getCurrentUser(req);
    const result = reviewModel.deleteReview(req.params.reviewId, currentUser.id);

    if (result.status === "not-found") {
      return res.status(404).send("Review not found.");
    }

    if (result.status === "forbidden") {
      return res.status(403).send("You may only delete your own review.");
    }

    return res.redirect("/review/product-review?status=deleted#customer-reviews");
  } catch (error) {
    return next(error);
  }
};

// GET action for the product detail frontend.
const showReviewDetailPage = (req, res, next) => {
  try {
    const reviewNumber = Number(req.params.reviewNumber);

    if (!Number.isInteger(reviewNumber) || reviewNumber < 1 || reviewNumber > 15) {
      return res.status(404).send("Product detail page not found.");
    }

    const detailData =
      reviewNumber === 1 ? reviewModel.getProductDetailPageData() : {};

    return res.render(
      `review/product_detail/review${reviewNumber}`,
      detailData
    );
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
