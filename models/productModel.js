"use strict";

const adminProductModel = require("./adminProductModel");

const getBaseProducts = () =>
  adminProductModel
    .getAvailableStorefrontProducts()
    .sort((a, b) => (a.featuredOrder || 999) - (b.featuredOrder || 999));

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);

const createStars = (rating) => {
  const rounded = Math.max(
    0,
    Math.min(5, Math.round(Number(rating) || 0)),
  );

  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
};

const toArray = (value) => {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).map(String);
};

const decorateProduct = (product, statsMap = {}) => {
  const stats = statsMap[String(product.id)] || {
    averageRating: 0,
    totalReviews: 0,
  };

  const href = `/products/${product.slug}`;

  return {
    ...product,
    href,
    reviewHref: `${href}?tab=review`,
    priceDisplay: formatCurrency(product.price),
    priceFormatted: formatCurrency(product.price),
    oldPriceDisplay:
      product.oldPrice == null ? "" : formatCurrency(product.oldPrice),
    oldPriceFormatted:
      product.oldPrice == null ? null : formatCurrency(product.oldPrice),
    rating: stats.averageRating,
    reviewCount: stats.totalReviews,
    ratingStars: createStars(stats.averageRating),
    imageAlt: product.alt || product.name,
  };
};

const getDecoratedProducts = (statsMap = {}) =>
  getBaseProducts().map((product) => decorateProduct(product, statsMap));

const getSelectedFilters = (query = {}) => ({
  price: toArray(query.price),
  maker: toArray(query.maker),
  material: toArray(query.material),
  availability: toArray(query.availability),
  rating: toArray(query.rating),
});

const matchesPrice = (price, selected) => {
  if (!selected.length) return true;

  return selected.some((range) => {
    if (range === "under-25") return price < 25;
    if (range === "25-50") return price >= 25 && price < 50;
    if (range === "50-100") return price >= 50 && price < 100;
    if (range === "100-plus") return price >= 100;
    return false;
  });
};

const matchesAvailability = (stock, selected) => {
  if (!selected.length) return true;

  return selected.some((value) => {
    if (value === "in-stock") return stock > 5;
    if (value === "low-stock") return stock > 0 && stock <= 5;
    return false;
  });
};

const matchesRating = (rating, selected) => {
  if (!selected.length) return true;

  return selected.some((value) => {
    const minimum = Number(value);
    if (!Number.isFinite(minimum)) return false;

    return minimum === 5
      ? rating === 5
      : rating >= minimum;
  });
};

const getFilteredProducts = (filters, statsMap = {}) =>
  getDecoratedProducts(statsMap).filter((product) => {
    const makerMatches =
      !filters.maker.length ||
      filters.maker.includes(product.maker);

    const materialMatches =
      !filters.material.length ||
      filters.material.includes(product.material);

    return (
      matchesPrice(product.price, filters.price) &&
      makerMatches &&
      materialMatches &&
      matchesAvailability(product.stock, filters.availability) &&
      matchesRating(product.rating, filters.rating)
    );
  });

const getAllProducts = (statsMap = {}) =>
  getDecoratedProducts(statsMap);

const getProductById = (productId, statsMap = {}) =>
  getDecoratedProducts(statsMap).find(
    (product) => String(product.id) === String(productId),
  ) || null;

const getProductBySlug = (slug, statsMap = {}) =>
  getDecoratedProducts(statsMap).find(
    (product) => String(product.slug) === String(slug),
  ) || null;

const getProductByLegacyNumber = (legacyNumber, statsMap = {}) => {
  const number = Number(legacyNumber);
  if (!Number.isInteger(number)) return null;

  return (
    getDecoratedProducts(statsMap).find(
      (product) => product.featuredOrder === number,
    ) || null
  );
};

const getRecommendedProducts = (
  excludedIds = [],
  limit = 4,
  statsMap = {},
) => {
  const excluded = new Set(excludedIds.map(String));

  return getDecoratedProducts(statsMap)
    .filter(
      (product) =>
        product.stock > 0 &&
        !excluded.has(String(product.id)),
    )
    .sort(
      (a, b) =>
        (b.featuredOrder || 0) -
        (a.featuredOrder || 0),
    )
    .slice(0, limit);
};

const getCategories = () => {
  const categories = new Map();

  getBaseProducts().forEach((product) => {
    if (!categories.has(product.category)) {
      categories.set(product.category, {
        id: product.category,
        label: product.categoryLabel,
      });
    }
  });

  return [
    {
      id: "all",
      label: "All",
    },
    ...categories.values(),
  ];
};

const getCategoryCounts = () => {
  const baseProducts = getBaseProducts();
  const counts = {
    all: baseProducts.length,
  };

  baseProducts.forEach((product) => {
    counts[product.category] =
      (counts[product.category] || 0) + 1;
  });

  return counts;
};

const getFilterOptions = () => ({
  makers: [
    ...new Set(
      getBaseProducts().map((product) => product.maker),
    ),
  ].sort(),

  materials: [
    ...new Set(
      getBaseProducts().map((product) => product.material),
    ),
  ].sort(),

  availability: [
    {
      value: "in-stock",
      label: "In stock",
    },
    {
      value: "low-stock",
      label: "Low stock",
    },
  ],

  ratings: [
    {
      value: "1",
      label: "1 star & up",
    },
    {
      value: "2",
      label: "2 stars & up",
    },
    {
      value: "3",
      label: "3 stars & up",
    },
    {
      value: "4",
      label: "4 stars & up",
    },
    {
      value: "5",
      label: "5 stars only",
    },
  ],
});

const getSortOptions = () => [
  {
    id: "featured",
    label: "Best Sellers",
  },
  {
    id: "price-low",
    label: "Price: Low to high",
  },
  {
    id: "price-high",
    label: "Price: High to low",
  },
  {
    id: "name",
    label: "Name: A–Z",
  },
];

const getProductsPageData = (query = {}, statsMap = {}) => {
  const selectedFilters = getSelectedFilters(query);

  return {
    pageTitle: "Shop All",
    products: getFilteredProducts(selectedFilters, statsMap),
    categories: getCategories(),
    categoryCounts: getCategoryCounts(),
    filterOptions: getFilterOptions(),
    sortOptions: getSortOptions(),
    selectedFilters,
  };
};

const getFeaturedProducts = (limit = 6, statsMap = {}) =>
  getDecoratedProducts(statsMap)
    .filter((product) => product.stock > 0)
    .sort(
      (a, b) =>
        (a.featuredOrder || 999) -
        (b.featuredOrder || 999),
    )
    .slice(0, limit);

const getRelatedProducts = (
  currentProductId,
  limit = 3,
  statsMap = {},
) => {
  const allProducts = getDecoratedProducts(statsMap);

  const currentProduct = allProducts.find(
    (product) =>
      String(product.id) === String(currentProductId),
  );

  if (!currentProduct) return [];

  const sameCategory = allProducts.filter(
    (product) =>
      product.id !== currentProduct.id &&
      product.category === currentProduct.category,
  );

  const fallback = allProducts.filter(
    (product) =>
      product.id !== currentProduct.id &&
      product.category !== currentProduct.category,
  );

  return [...sameCategory, ...fallback].slice(0, limit);
};

module.exports = {
  getAllProducts,
  getCategories,
  getCategoryCounts,
  getFeaturedProducts,
  getFilterOptions,
  getProductById,
  getProductByLegacyNumber,
  getProductBySlug,
  getProductsPageData,
  getRecommendedProducts,
  getRelatedProducts,
  getSortOptions,
};