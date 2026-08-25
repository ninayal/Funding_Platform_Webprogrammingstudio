"use strict";

const { randomUUID } = require("node:crypto");
const Review = require("./schemas/Review");

const normaliseImages = (images) =>
  Array.isArray(images)
    ? images
        .map((image) => String(image || ""))
        .filter(Boolean)
        .slice(0, 3)
    : [];

const toRuntimeReview = (review) => {
  if (!review) {
    return null;
  }

  const images = normaliseImages(review.images);

  return {
    ...review,
    id: String(review._id),
    _id: String(review._id),
    productId: String(review.productId),
    userId: String(review.userId),
    images,
    image: images[0] || ""
  };
};

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

const getReviewsByProductId = async (
  productId
) => {
  const reviews = await Review.find({
    productId: String(productId)
  })
    .sort({ dateAdded: -1 })
    .lean();

  return reviews.map(toRuntimeReview);
};

const getReviewById = async (
  productId,
  reviewId
) => {
  const review = await Review.findOne({
    _id: String(reviewId),
    productId: String(productId)
  }).lean();

  return toRuntimeReview(review);
};

const getReviewStats = async (
  productId
) => {
  const reviews = await Review.find({
    productId: String(productId)
  })
    .select({ rating: 1 })
    .lean();

  return calculateStats(reviews);
};

const getAllReviewStats = async () => {
  const reviews = await Review.find({})
    .select({
      productId: 1,
      rating: 1
    })
    .lean();

  const groupedReviews = {};

  reviews.forEach((review) => {
    const productId =
      String(review.productId);

    if (!groupedReviews[productId]) {
      groupedReviews[productId] = [];
    }

    groupedReviews[productId].push(review);
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

const createReview = async (
  productId,
  reviewData
) => {
  const review = await Review.create({
    _id: `review-${randomUUID()}`,
    productId: String(productId),
    userId: String(reviewData.userId),
    name: String(reviewData.name || ""),
    rating: Number(reviewData.rating),
    title: String(reviewData.title),
    comment: String(reviewData.comment),
    images: normaliseImages(
      reviewData.images
    ),
    dateAdded: new Date()
  });

  return toRuntimeReview(
    review.toObject()
  );
};

const updateReview = async (
  productId,
  reviewId,
  currentUserId,
  reviewData
) => {
  const filter = {
    _id: String(reviewId),
    productId: String(productId)
  };

  const existingReview =
    await Review.findOne(filter)
      .select({ userId: 1 })
      .lean();

  if (!existingReview) {
    return {
      status: "not-found",
      review: null
    };
  }

  if (
    String(existingReview.userId) !==
    String(currentUserId)
  ) {
    return {
      status: "forbidden",
      review: null
    };
  }

  const updatedReview =
    await Review.findOneAndUpdate(
      {
        ...filter,
        userId: String(currentUserId)
      },
      {
        rating: Number(reviewData.rating),
        title: String(reviewData.title),
        comment: String(reviewData.comment),
        images: normaliseImages(
          reviewData.images
        )
      },
      {
        new: true,
        runValidators: true
      }
    ).lean();

  return {
    status: "updated",
    review: toRuntimeReview(
      updatedReview
    )
  };
};

const deleteReview = async (
  productId,
  reviewId,
  currentUserId
) => {
  const filter = {
    _id: String(reviewId),
    productId: String(productId)
  };

  const existingReview =
    await Review.findOne(filter)
      .select({ userId: 1 })
      .lean();

  if (!existingReview) {
    return {
      status: "not-found",
      review: null
    };
  }

  if (
    String(existingReview.userId) !==
    String(currentUserId)
  ) {
    return {
      status: "forbidden",
      review: null
    };
  }

  const deletedReview =
    await Review.findOneAndDelete({
      ...filter,
      userId: String(currentUserId)
    });

  return {
    status: "deleted",
    review: deletedReview
      ? toRuntimeReview(
          deletedReview.toObject()
        )
      : null
  };
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