"use strict";

const productModel = require(
  "../models/productModel"
);

const reviewModel = require(
  "../models/reviewModel"
);

const ratingValues = [5, 4, 3, 2, 1];

const searchFields = [
  { value: "all", label: "All fields" },
  { value: "title", label: "Title" },
  {
    value: "reviewer",
    label: "Reviewer"
  },
  { value: "date", label: "Date" },
  {
    value: "description",
    label: "Review text"
  }
];

const getCurrentUser = (req) => {
  const sessionUser =
    req.currentUser ||
    req.session?.user ||
    null;

  if (!sessionUser?.id) {
    return null;
  }

  return {
    id: String(sessionUser.id),
    name: String(
      sessionUser.name ||
      sessionUser.username ||
      "Signed-in user"
    )
  };
};

const getCartCount = (req) =>
  Array.isArray(req.session?.cart)
    ? req.session.cart.reduce(
        (total, item) =>
          total +
          Number(item.quantity || 0),
        0
      )
    : 0;

const createStars = (rating) => {
  const rounded = Math.max(
    0,
    Math.min(
      5,
      Math.round(
        Number(rating) || 0
      )
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
    year: "numeric"
  }).format(new Date(value));

const getStatusMessage = (status) =>
  ({
    created:
      "Your review was published successfully.",
    updated:
      "Your review was updated successfully.",
    deleted:
      "Your review was deleted successfully."
  })[status] || "";

const emptyFormValues = () => ({
  rating: "",
  reviewTitle: "",
  review: "",
  existingImage: ""
});

const buildTabs = (openReview) => [
  {
    id: "description",
    label: "Description",
    isDefault: !openReview
  },
  {
    id: "info",
    label: "Additional Info",
    isDefault: false
  },
  {
    id: "review",
    label: "Review",
    isDefault: openReview
  }
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

const buildReviewData = (
  req,
  product,
  options = {}
) => {
  const currentUser = getCurrentUser(req);
  const isAuthenticated =
    Boolean(currentUser?.id);

  const rawReviews =
    reviewModel.getReviewsByProductId(
      product.id
    );

  const stats =
    reviewModel.getReviewStats(
      product.id
    );

  const reviews = rawReviews.map(
    (review) => ({
      ...review,

      isOwn:
        isAuthenticated &&
        review.userId === currentUser.id,

      avatar:
        String(review.name || "?")
          .trim()
          .charAt(0)
          .toUpperCase(),

      stars: createStars(review.rating),

      dateValue: String(
        review.dateAdded
      ).slice(0, 10),

      dateLabel: formatReviewDate(
        review.dateAdded
      ),

      displayImage:
        String(review.image || ""),

      hasImage:
        Boolean(review.image)
    })
  );

  const serverErrors =
    options.serverErrors || {};

  const formMode =
    options.formMode || "create";

  const formOpen =
    Boolean(options.formOpen) ||
    formMode === "edit" ||
    req.query.compose === "1" ||
    Object.keys(serverErrors).length > 0;

  return {
    product: {
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      imageAlt: product.alt
    },

    currentUser,
    isAuthenticated,
    loginUrl:
      buildLoginUrl(product),

    reviews,

    totalReviews:
      stats.totalReviews,

    averageRating:
      stats.averageRating.toFixed(1),

    ratingBreakdown:
      stats.ratingBreakdown,

    displayAverageStars:
      createStars(
        stats.averageRating
      ),

    ratingValues,
    searchFields,

    formMode,

    formOpen,

    editingReviewId:
      options.editingReviewId || "",

    formValues:
      options.formValues ||
      emptyFormValues(),

    serverErrors,

    pageMessage:
      options.pageMessage ||
      getStatusMessage(
        req.query.status
      ),

    pageStatus:
      req.query.status || "",

    reviewDateValue:
      new Date()
        .toISOString()
        .slice(0, 10),

    returnPath: product.href
  };
};

const renderProductDetail = (
  req,
  res,
  options = {}
) => {
  const product =
    options.product ||
    productModel.getProductBySlug(
      req.params.slug
    );

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
    reviewModel.getReviewStats(
      product.id
    );

  const productData = {
    ...product,
    rating: stats.averageRating,
    reviewCount: stats.totalReviews
  };

  return res
    .status(options.statusCode || 200)
    .render(
      "products/product-detail",
      {
        pageTitle: product.name,
        activePage: "shop",
        cartCount:
          getCartCount(req),

        productData,

        productStars:
          createStars(
            stats.averageRating
          ),

        relatedProductsData:
          productModel.getRelatedProducts(
            product.id,
            3
          ),

        tabs:
          buildTabs(openReview),

        ...buildReviewData(
          req,
          product,
          options
        )
      }
    );
};

const showProductDetail = (
  req,
  res,
  next
) => {
  try {
    return renderProductDetail(
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
  showProductDetail
};
