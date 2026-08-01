"use strict";

const productModel = require(
  "../models/productModel"
);

const reviewModel = require(
  "../models/reviewModel"
);

const {
  getCurrentUser,
  renderProductDetail
} = require("./productController");

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

  if (
    image.startsWith("/images/") ||
    image.startsWith("/uploads/")
  ) {
    return true;
  }

  try {
    const parsedUrl = new URL(image);

    return (
      parsedUrl.protocol === "http:" ||
      parsedUrl.protocol === "https:"
    );
  } catch {
    return false;
  }
};

const validateReview = (body) => {
  const values = {
    rating: Number(body.rating),
    reviewTitle:
      cleanSingleLine(body.reviewTitle),
    review:
      cleanParagraph(body.review),
    imageUrl:
      cleanSingleLine(body.imageUrl)
  };

  const errors = {};

  if (
    !Number.isInteger(values.rating) ||
    values.rating < 1 ||
    values.rating > 5
  ) {
    errors.rating =
      "Choose a rating from 1 to 5 stars.";
  }

  if (
    values.reviewTitle.length < 4 ||
    values.reviewTitle.length > 80
  ) {
    errors.reviewTitle =
      "The title must contain between 4 and 80 characters.";
  } else if (
    !/[\p{L}\p{N}]/u.test(
      values.reviewTitle
    )
  ) {
    errors.reviewTitle =
      "The title must contain at least one letter or number.";
  }

  const wordCount = values.review
    .split(/\s+/)
    .filter(Boolean)
    .length;

  if (
    values.review.length < 10 ||
    values.review.length > 600
  ) {
    errors.review =
      "The review must contain between 10 and 600 characters.";
  } else if (wordCount < 3) {
    errors.review =
      "The review must contain at least three words.";
  }

  if (values.imageUrl.length > 500) {
    errors.imageUrl =
      "The image URL must not exceed 500 characters.";
  } else if (
    !isValidImagePath(values.imageUrl)
  ) {
    errors.imageUrl =
      "Use an http(s) URL or a local /images/ or /uploads/ path.";
  }

  return { values, errors };
};

const getProductOr404 = (req, res) => {
  const product =
    productModel.getProductBySlug(
      req.params.slug
    );

  if (!product) {
    res
      .status(404)
      .send("Product not found.");

    return null;
  }

  return product;
};

const redirectToReviews = (
  res,
  product,
  status
) => {
  const params = new URLSearchParams({
    tab: "review",
    status
  });

  return res.redirect(
    `${product.href}?${params}` +
    "#customer-reviews"
  );
};

const createReview = (
  req,
  res,
  next
) => {
  try {
    const product =
      getProductOr404(req, res);

    if (!product) {
      return;
    }

    const currentUser =
      getCurrentUser(req);

    const { values, errors } =
      validateReview(req.body);

    if (Object.keys(errors).length) {
      return renderProductDetail(
        req,
        res,
        {
          product,
          statusCode: 422,
          openReviewTab: true,
          formValues: values,
          serverErrors: errors,
          pageMessage:
            "Correct the highlighted fields before submitting."
        }
      );
    }

    reviewModel.createReview(
      product.id,
      {
        userId: currentUser.id,
        name: currentUser.name,
        rating: values.rating,
        title: values.reviewTitle,
        comment: values.review,
        image: values.imageUrl
      }
    );

    return redirectToReviews(
      res,
      product,
      "created"
    );
  } catch (error) {
    return next(error);
  }
};

const showEditReviewPage = (
  req,
  res,
  next
) => {
  try {
    const product =
      getProductOr404(req, res);

    if (!product) {
      return;
    }

    const currentUser =
      getCurrentUser(req);

    const review =
      reviewModel.getReviewById(
        product.id,
        req.params.reviewId
      );

    if (!review) {
      return res
        .status(404)
        .send("Review not found.");
    }

    if (
      review.userId !== currentUser.id
    ) {
      return res
        .status(403)
        .send(
          "You may only edit your own review."
        );
    }

    return renderProductDetail(
      req,
      res,
      {
        product,
        openReviewTab: true,
        formMode: "edit",
        editingReviewId: review.id,
        formValues: {
          rating: review.rating,
          reviewTitle: review.title,
          review: review.comment,
          imageUrl: review.image
        },
        pageMessage:
          "You are editing your review."
      }
    );
  } catch (error) {
    return next(error);
  }
};

const updateReview = (
  req,
  res,
  next
) => {
  try {
    const product =
      getProductOr404(req, res);

    if (!product) {
      return;
    }

    const currentUser =
      getCurrentUser(req);

    const existingReview =
      reviewModel.getReviewById(
        product.id,
        req.params.reviewId
      );

    if (!existingReview) {
      return res
        .status(404)
        .send("Review not found.");
    }

    if (
      existingReview.userId !==
      currentUser.id
    ) {
      return res
        .status(403)
        .send(
          "You may only update your own review."
        );
    }

    const { values, errors } =
      validateReview(req.body);

    if (Object.keys(errors).length) {
      return renderProductDetail(
        req,
        res,
        {
          product,
          statusCode: 422,
          openReviewTab: true,
          formMode: "edit",
          editingReviewId:
            existingReview.id,
          formValues: values,
          serverErrors: errors,
          pageMessage:
            "Correct the highlighted fields before updating."
        }
      );
    }

    const result =
      reviewModel.updateReview(
        product.id,
        existingReview.id,
        currentUser.id,
        {
          rating: values.rating,
          title: values.reviewTitle,
          comment: values.review,
          image: values.imageUrl
        }
      );

    if (result.status === "forbidden") {
      return res
        .status(403)
        .send(
          "You may only update your own review."
        );
    }

    return redirectToReviews(
      res,
      product,
      "updated"
    );
  } catch (error) {
    return next(error);
  }
};

const deleteReview = (
  req,
  res,
  next
) => {
  try {
    const product =
      getProductOr404(req, res);

    if (!product) {
      return;
    }

    const currentUser =
      getCurrentUser(req);

    const result =
      reviewModel.deleteReview(
        product.id,
        req.params.reviewId,
        currentUser.id
      );

    if (result.status === "not-found") {
      return res
        .status(404)
        .send("Review not found.");
    }

    if (result.status === "forbidden") {
      return res
        .status(403)
        .send(
          "You may only delete your own review."
        );
    }

    return redirectToReviews(
      res,
      product,
      "deleted"
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createReview,
  deleteReview,
  showEditReviewPage,
  updateReview
};
