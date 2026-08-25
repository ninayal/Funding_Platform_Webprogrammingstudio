"use strict";

const productModel = require("../models/productModel");
const reviewModel = require("../models/reviewModel");

const ratingValues = [5, 4, 3, 2, 1];
const formRatingValues = [1, 2, 3, 4, 5];

const searchFields = [
  { value: "all", label: "All fields" },
  { value: "title", label: "Title" },
  { value: "reviewer", label: "Reviewer" },
  { value: "date", label: "Date" },
  {
    value: "description",
    label: "Review text",
  },
];

const getCurrentUser = (req) => {
  const user =
    req.currentUser ||
    req.session?.user ||
    null;

  if (!user?.id) return null;

  return {
    id: String(user.id),
    name: String(
      user.name ||
      user.username ||
      "Signed-in user"
    ),
  };
};

const createStars = (rating) => {
  const rounded = Math.max(
    0,
    Math.min(
      5,
      Math.round(Number(rating) || 0)
    )
  );

  return (
    "★".repeat(rounded) +
    "☆".repeat(5 - rounded)
  );
};

const formatReviewDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));

const getStatusMessage = (status) =>
  ({
    created:
      "Your review was published successfully.",
    updated:
      "Your review was updated successfully.",
    deleted:
      "Your review was deleted successfully.",
  })[status] || "";

const emptyFormValues = () => ({
  rating: "",
  reviewTitle: "",
  review: "",
  existingImages: [],
});

const buildTabs = (openReview) => [
  {
    id: "description",
    label: "Description",
    isDefault: !openReview,
  },
  {
    id: "info",
    label: "Additional Info",
    isDefault: false,
  },
  {
    id: "review",
    label: "Review",
    isDefault: openReview,
  },
];

const buildLoginUrl = (product) => {
  const returnPath =
    `${product.href}` +
    "?tab=review&compose=1" +
    "#review-composer";

  return (
    "/shared/login?redirect=" +
    encodeURIComponent(returnPath)
  );
};

const normalizeExistingImages = (
  formValues
) => {
  if (
    Array.isArray(
      formValues.existingImages
    )
  ) {
    return formValues.existingImages.filter(
      Boolean
    );
  }

  if (formValues.existingImage) {
    return [formValues.existingImage];
  }

  return [];
};

const normalizeReviewImages = (
  review
) => {
  if (
    Array.isArray(review.images) &&
    review.images.length
  ) {
    return review.images;
  }

  if (review.image) {
    return [review.image];
  }

  return [];
};

const buildReviewCards = (
  rawReviews,
  currentUser
) =>
  rawReviews.map((review) => {
    const images =
      normalizeReviewImages(review);

    return {
      ...review,

      isOwn:
        Boolean(currentUser?.id) &&
        review.userId ===
        currentUser.id,

      avatar: String(
        review.name || "?"
      )
        .trim()
        .charAt(0)
        .toUpperCase(),

      stars: createStars(
        review.rating
      ),

      dateValue: String(
        review.dateAdded
      ).slice(0, 10),

      dateLabel: formatReviewDate(
        review.dateAdded
      ),

      searchTitle: String(
        review.title || ""
      ).toLowerCase(),

      searchReviewer: String(
        review.name || ""
      ).toLowerCase(),

      searchDescription: String(
        review.comment || ""
      ).toLowerCase(),

      images: images
        .slice(0, 3)
        .map((image, index) => ({
          src: image,
          alt: `Review photo ${index + 1
            }`,
          openLabel:
            `Open review photo ${index + 1
            } in full screen`,
        })),
    };
  });

const buildReviewOverview = (
  product,
  stats,
  isAuthenticated,
  loginUrl,
  formOpen,
  pageMessage
) => {
  const overallRating = Math.max(
    0,
    Math.min(
      5,
      Number(
        stats.averageRating
      ) || 0
    )
  );

  return {
    productName: product.name,
    pageMessage,
    ratingBreakdown:
      stats.ratingBreakdown,

    overallRating:
      overallRating.toFixed(1),

    overallPercent:
      (overallRating / 5) * 100,

    totalReviewLabel:
      stats.totalReviews === 1
        ? "1 review"
        : `${stats.totalReviews} reviews`,

    isAuthenticated,
    loginUrl,
    formOpen,

    ratingOptions:
      formRatingValues.map(
        (rating) => ({
          value: rating,
          label:
            `${rating} out of 5 stars`,
          loginLabel:
            `Sign in to give ${rating} out of 5 stars`,
        })
      ),
  };
};

const buildReviewForm = (
  product,
  currentUser,
  formMode,
  editingReviewId,
  formValues,
  serverErrors
) => {
  const existingImages =
    normalizeExistingImages(
      formValues
    );

  const isEdit =
    formMode === "edit";

  return {
    mode: formMode,
    isEdit,

    action: isEdit
      ? `/products/${product.slug}/reviews/${editingReviewId}/update`
      : `/products/${product.slug}/reviews`,

    eyebrow: isEdit
      ? "Update review"
      : "Share your experience",

    title: isEdit
      ? "Edit your review"
      : "Write your review",

    description: isEdit
      ? "Keep, remove, or add photos before saving."
      : `Tell other customers what stood out about ${product.name}.`,

    reviewerName:
      currentUser?.name || "",

    titleValue:
      formValues.reviewTitle || "",

    reviewValue:
      formValues.review || "",

    errors: serverErrors,

    submitLabel: isEdit
      ? "Save Changes"
      : "Publish Review",

    showCancel: isEdit,

    cancelUrl:
      `${product.href}` +
      "?tab=review" +
      "#customer-reviews",

    existingImageCount:
      existingImages.length,

    imageRequired:
      !isEdit &&
      existingImages.length === 0,

    existingImages:
      existingImages.map(
        (image, index) => ({
          src: image,
          index,
          alt:
            `Existing review photo ${index + 1
            }`,
          removeLabel:
            `Remove existing photo ${index + 1
            }`,
        })
      ),

    ratingOptions:
      formRatingValues.map(
        (rating, index) => ({
          value: rating,
          label:
            `${rating} out of 5 stars`,
          checked:
            Number(
              formValues.rating
            ) === rating,
          required: index === 0,
        })
      ),
  };
};

const buildReviewList = (
  reviews
) => ({
  reviews,

  initialResultLabel:
    reviews.length === 1
      ? "1 review found."
      : `${reviews.length} reviews found.`,

  filterRatings: ratingValues,
  searchFields,
});

const buildReviewData = async (
  req,
  product,
  options = {}
) => {
  const currentUser =
    getCurrentUser(req);

  const isAuthenticated =
    Boolean(currentUser?.id);

  const [rawReviews, stats] =
    await Promise.all([
      reviewModel.getReviewsByProductId(
        product.id
      ),

      reviewModel.getReviewStats(
        product.id
      ),
    ]);

  const serverErrors =
    options.serverErrors || {};

  const formMode =
    options.formMode || "create";

  const formOpen =
    Boolean(options.formOpen) ||
    formMode === "edit" ||
    req.query.compose === "1" ||
    Object.keys(serverErrors).length >
    0;

  const formValues =
    options.formValues ||
    emptyFormValues();

  const pageMessage =
    options.pageMessage ||
    getStatusMessage(
      req.query.status
    );

  const loginUrl =
    buildLoginUrl(product);

  const reviews =
    buildReviewCards(
      rawReviews,
      currentUser
    );

  return {
    product: {
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      imageAlt: product.alt,
    },

    currentUser,

    reviewUi: {
      isAuthenticated,
      formOpen,
      formMode,

      editingReviewId:
        options.editingReviewId ||
        "",

      pageStatus:
        req.query.status || "",
    },

    reviewOverview:
      buildReviewOverview(
        product,
        stats,
        isAuthenticated,
        loginUrl,
        formOpen,
        pageMessage
      ),

    reviewForm:
      buildReviewForm(
        product,
        currentUser,
        formMode,
        options.editingReviewId ||
        "",
        formValues,
        serverErrors
      ),

    reviewList:
      buildReviewList(reviews),
  };
};

const renderProductDetail = async (
  req,
  res,
  options = {}
) => {
  const product =
    options.product ||
    (await productModel
      .getProductBySlug(
        req.params.slug
      ));

  if (!product) {
    return res
      .status(404)
      .send("Product not found.");
  }

  const openReview =
    options.openReviewTab ||
    req.query.tab === "review" ||
    req.query.compose === "1" ||
    Boolean(req.query.status);

  const stats =
    await reviewModel.getReviewStats(
      product.id
    );

  const relatedProductsData =
    await productModel
      .getRelatedProducts(
        product.id,
        3
      );

  const productData = {
    ...product,

    rating:
      stats.averageRating,

    ratingDisplay:
      Number(
        stats.averageRating || 0
      ).toFixed(1),

    reviewCount:
      stats.totalReviews,

    reviewCountLabel:
      stats.totalReviews === 1
        ? "1 review"
        : `${stats.totalReviews} reviews`,
  };

  const reviewData =
    await buildReviewData(
      req,
      product,
      options
    );

  return res
    .status(
      options.statusCode || 200
    )
    .render(
      "products/product-detail",
      {
        pageTitle:
          product.name,

        activePage: "shop",

        cartCount:
          Number(
            res.locals
              .cartCount || 0
          ),

        productData,

        productStars:
          createStars(
            stats.averageRating
          ),

        relatedProductsData,

        tabs:
          buildTabs(openReview),

        ...reviewData,
      }
    );
};

const showProductDetail = async (
  req,
  res,
  next
) => {
  try {
    return await renderProductDetail(
      req,
      res
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCurrentUser,
  renderProductDetail,
  showProductDetail,
};