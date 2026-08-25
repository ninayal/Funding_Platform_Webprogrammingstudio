"use strict";

const productModel = require("../models/productModel");
const reviewModel = require("../models/reviewModel");

const {
  getCurrentUser,
  renderProductDetail,
} = require("./productController");

const MAX_REVIEW_IMAGE_COUNT = 3;

const cleanSingleLine = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim();

const cleanParagraph = (value) =>
  String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();

const convertImagesToDataUrls = (files) => {
  if (!Array.isArray(files)) return [];

  return files
    .filter((file) => file?.buffer && file?.mimetype)
    .map(
      (file) =>
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
    );
};

const toArray = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return [];
  }

  return Array.isArray(value)
    ? value
    : [value];
};

const selectKeptImages = (
  existingImages,
  submittedIndexes
) => {
  const source = Array.isArray(existingImages)
    ? existingImages
    : [];

  const indexes = [
    ...new Set(
      toArray(submittedIndexes)
        .map(Number)
        .filter(
          (index) =>
            Number.isInteger(index) &&
            index >= 0 &&
            index < source.length
        )
    ),
  ];

  return indexes.map(
    (index) => source[index]
  );
};

const validateReview = (
  body,
  {
    imageCount = 0,
    uploadError = "",
  } = {}
) => {
  const values = {
    rating: Number(body.rating),
    reviewTitle: cleanSingleLine(
      body.reviewTitle
    ),
    review: cleanParagraph(body.review),
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
    .filter(Boolean).length;

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

  if (uploadError) {
    errors.reviewImages = uploadError;
  } else if (imageCount < 1) {
    errors.reviewImages =
      "Upload at least one product photo.";
  } else if (
    imageCount > MAX_REVIEW_IMAGE_COUNT
  ) {
    errors.reviewImages =
      "Upload no more than 3 images.";
  }

  return {
    values,
    errors,
  };
};

const getProductOr404 = async (
  req,
  res
) => {
  const product =
    await productModel.getProductBySlug(
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

const getAuthenticatedUser = (
  req,
  res
) => {
  const currentUser =
    getCurrentUser(req);

  if (!currentUser) {
    res
      .status(401)
      .send(
        "Sign in before writing a review."
      );

    return null;
  }

  return currentUser;
};

const redirectToReviews = (
  res,
  product,
  status
) => {
  const params =
    new URLSearchParams({
      tab: "review",
      status,
    });

  return res.redirect(
    `${product.href}?${params}` +
      "#customer-reviews"
  );
};

const createReview = async (
  req,
  res,
  next
) => {
  try {
    const product =
      await getProductOr404(req, res);

    if (!product) return;

    const currentUser =
      getAuthenticatedUser(req, res);

    if (!currentUser) return;

    const newImages =
      convertImagesToDataUrls(
        req.files
      );

    const {
      values,
      errors,
    } = validateReview(req.body, {
      imageCount: newImages.length,
      uploadError:
        req.reviewUploadError,
    });

    if (Object.keys(errors).length) {
      return await renderProductDetail(
        req,
        res,
        {
          product,
          statusCode: 422,
          openReviewTab: true,
          formOpen: true,

          formValues: {
            ...values,
            existingImages: [],
          },

          serverErrors: errors,

          pageMessage:
            errors.reviewImages ||
            "Correct the highlighted fields. Select the images again before resubmitting.",
        }
      );
    }

    await reviewModel.createReview(
      product.id,
      {
        userId: currentUser.id,
        name: currentUser.name,
        rating: values.rating,
        title: values.reviewTitle,
        comment: values.review,
        images: newImages,
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

const showEditReviewPage = async (
  req,
  res,
  next
) => {
  try {
    const product =
      await getProductOr404(req, res);

    if (!product) return;

    const currentUser =
      getAuthenticatedUser(req, res);

    if (!currentUser) return;

    const review =
      await reviewModel.getReviewById(
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

    return await renderProductDetail(
      req,
      res,
      {
        product,
        openReviewTab: true,
        formOpen: true,
        formMode: "edit",

        editingReviewId: review.id,

        formValues: {
          rating: review.rating,
          reviewTitle: review.title,
          review: review.comment,
          existingImages:
            review.images || [],
        },

        pageMessage:
          "You are editing your review.",
      }
    );
  } catch (error) {
    return next(error);
  }
};

const updateReview = async (
  req,
  res,
  next
) => {
  try {
    const product =
      await getProductOr404(req, res);

    if (!product) return;

    const currentUser =
      getAuthenticatedUser(req, res);

    if (!currentUser) return;

    const existingReview =
      await reviewModel.getReviewById(
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

    const keptImages =
      selectKeptImages(
        existingReview.images,
        req.body.keepImageIndexes
      );

    const newImages =
      convertImagesToDataUrls(
        req.files
      );

    const finalImages = [
      ...keptImages,
      ...newImages,
    ];

    const {
      values,
      errors,
    } = validateReview(req.body, {
      imageCount: finalImages.length,
      uploadError:
        req.reviewUploadError,
    });

    if (Object.keys(errors).length) {
      return await renderProductDetail(
        req,
        res,
        {
          product,
          statusCode: 422,
          openReviewTab: true,
          formOpen: true,
          formMode: "edit",

          editingReviewId:
            existingReview.id,

          formValues: {
            ...values,
            existingImages:
              keptImages,
          },

          serverErrors: errors,

          pageMessage:
            "Correct the highlighted fields. Newly selected images must be selected again.",
        }
      );
    }

    const result =
      await reviewModel.updateReview(
        product.id,
        existingReview.id,
        currentUser.id,
        {
          rating: values.rating,
          title: values.reviewTitle,
          comment: values.review,
          images: finalImages,
        }
      );

    if (
      result.status === "not-found"
    ) {
      return res
        .status(404)
        .send("Review not found.");
    }

    if (
      result.status === "forbidden"
    ) {
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

const deleteReview = async (
  req,
  res,
  next
) => {
  try {
    const product =
      await getProductOr404(req, res);

    if (!product) return;

    const currentUser =
      getAuthenticatedUser(req, res);

    if (!currentUser) return;

    const result =
      await reviewModel.deleteReview(
        product.id,
        req.params.reviewId,
        currentUser.id
      );

    if (
      result.status === "not-found"
    ) {
      return res
        .status(404)
        .send("Review not found.");
    }

    if (
      result.status === "forbidden"
    ) {
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
  updateReview,
};