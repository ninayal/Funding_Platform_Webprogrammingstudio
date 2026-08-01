"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const reviewsFilePath = path.join(
  __dirname,
  "../data/reviews.json"
);

const clone = (value) =>
  JSON.parse(JSON.stringify(value));

const ensureReviewsFile = () => {
  if (!fs.existsSync(reviewsFilePath)) {
    fs.writeFileSync(
      reviewsFilePath,
      "[]\n",
      "utf8"
    );
  }
};

const readReviews = () => {
  ensureReviewsFile();

  const raw = fs.readFileSync(
    reviewsFilePath,
    "utf8"
  );

  const parsed = JSON.parse(raw || "[]");

  if (!Array.isArray(parsed)) {
    throw new TypeError(
      "data/reviews.json must contain an array."
    );
  }

  return parsed;
};

const writeReviews = (reviews) => {
  const temporaryPath =
    `${reviewsFilePath}.${process.pid}.tmp`;

  fs.writeFileSync(
    temporaryPath,
    `${JSON.stringify(reviews, null, 2)}\n`,
    "utf8"
  );

  fs.renameSync(
    temporaryPath,
    reviewsFilePath
  );
};

const sortNewestFirst = (reviews) =>
  reviews.sort(
    (first, second) =>
      new Date(second.dateAdded) -
      new Date(first.dateAdded)
  );

const calculateStats = (reviews) => {
  const totalReviews = reviews.length;

  const totalRating = reviews.reduce(
    (total, review) =>
      total + Number(review.rating || 0),
    0
  );

  const averageRating = totalReviews
    ? totalRating / totalReviews
    : 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map(
    (rating) => {
      const count = reviews.filter(
        (review) =>
          Number(review.rating) === rating
      ).length;

      return {
        rating,
        count,
        percentage: totalReviews
          ? Math.round(
              (count / totalReviews) * 100
            )
          : 0
      };
    }
  );

  return {
    totalReviews,
    averageRating: Number(
      averageRating.toFixed(1)
    ),
    ratingBreakdown
  };
};

const getReviewsByProductId = (productId) => {
  const reviews = readReviews().filter(
    (review) =>
      review.productId === String(productId)
  );

  return clone(sortNewestFirst(reviews));
};

const getReviewById = (
  productId,
  reviewId
) => {
  const review = readReviews().find(
    (item) =>
      item.id === String(reviewId) &&
      item.productId === String(productId)
  );

  return review ? clone(review) : null;
};

const getReviewStats = (productId) =>
  calculateStats(
    readReviews().filter(
      (review) =>
        review.productId === String(productId)
    )
  );

const getAllReviewStats = () => {
  const reviews = readReviews();
  const groupedReviews = {};

  reviews.forEach((review) => {
    if (!groupedReviews[review.productId]) {
      groupedReviews[review.productId] = [];
    }

    groupedReviews[review.productId].push(review);
  });

  return Object.fromEntries(
    Object.entries(groupedReviews).map(
      ([productId, productReviews]) => [
        productId,
        calculateStats(productReviews)
      ]
    )
  );
};

const createReview = (
  productId,
  reviewData
) => {
  const reviews = readReviews();

  const review = {
    id: `review-${randomUUID()}`,
    productId: String(productId),
    userId: String(reviewData.userId),
    name: String(reviewData.name),
    dateAdded: new Date().toISOString(),
    rating: Number(reviewData.rating),
    title: String(reviewData.title),
    comment: String(reviewData.comment),
    image: String(reviewData.image || "")
  };

  reviews.unshift(review);
  writeReviews(reviews);

  return clone(review);
};

const updateReview = (
  productId,
  reviewId,
  currentUserId,
  reviewData
) => {
  const reviews = readReviews();

  const index = reviews.findIndex(
    (review) =>
      review.id === String(reviewId) &&
      review.productId === String(productId)
  );

  if (index === -1) {
    return {
      status: "not-found",
      review: null
    };
  }

  if (
    reviews[index].userId !==
    String(currentUserId)
  ) {
    return {
      status: "forbidden",
      review: null
    };
  }

  reviews[index] = {
    ...reviews[index],
    rating: Number(reviewData.rating),
    title: String(reviewData.title),
    comment: String(reviewData.comment),
    image: String(reviewData.image || ""),
    dateAdded: new Date().toISOString()
  };

  writeReviews(reviews);

  return {
    status: "updated",
    review: clone(reviews[index])
  };
};

const deleteReview = (
  productId,
  reviewId,
  currentUserId
) => {
  const reviews = readReviews();

  const index = reviews.findIndex(
    (review) =>
      review.id === String(reviewId) &&
      review.productId === String(productId)
  );

  if (index === -1) {
    return { status: "not-found" };
  }

  if (
    reviews[index].userId !==
    String(currentUserId)
  ) {
    return { status: "forbidden" };
  }

  reviews.splice(index, 1);
  writeReviews(reviews);

  return { status: "deleted" };
};

module.exports = {
  createReview,
  deleteReview,
  getAllReviewStats,
  getReviewById,
  getReviewStats,
  getReviewsByProductId,
  updateReview
};
