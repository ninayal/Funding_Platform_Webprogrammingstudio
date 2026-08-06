"use strict";

const products = require("../data/products");
const reviewModel = require("./reviewModel");

const categories = [
  { id: "all", label: "All" },
  { id: "ceramics", label: "Ceramics" },
  { id: "painting", label: "Painting" },
  { id: "brocade", label: "Brocade" },
  { id: "bamboo", label: "Bamboo" },
  { id: "wood", label: "Wood" },
  { id: "incense", label: "Incense" },
  { id: "stone", label: "Fengshui Stone" },
  { id: "waterpuppet", label: "Water Puppets" }
];

const filters = [
  {
    title: "Price",
    open: true,
    options: [
      "Under $25",
      "$25 – $50",
      "$50 – $100",
      "$100 & over"
    ]
  },
  {
    title: "Craft Village",
    open: false,
    options: [
      "Bát Tràng · Hanoi",
      "Vạn Phúc · Hà Đông",
      "Quảng Phú Cầu · Hanoi",
      "Đông Hồ · Bắc Ninh",
      "Đồng Kỵ · Bắc Ninh",
      "Non Nước · Đà Nẵng",
      "Đào Thục · Hanoi"
    ]
  },
  {
    title: "Material",
    open: false,
    options: [
      "Ceramic",
      "Brocade",
      "Incense",
      "Paper",
      "Stone",
      "Wood"
    ]
  },
  {
    title: "Availability",
    open: false,
    options: ["In stock", "Low stock"]
  },
  {
    title: "Rating",
    open: false,
    options: ["★★★★ & up", "★★★★★ only"]
  }
];

const sortOptions = [
  { id: "featured", label: "Best Sellers" },
  { id: "low", label: "Price: Low to high" },
  { id: "high", label: "Price: High to low" },
  { id: "name", label: "Name: A–Z" }
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(Number(value) || 0);

const createStars = (rating) => {
  const rounded = Math.max(
    0,
    Math.min(5, Math.round(Number(rating) || 0))
  );

  return (
    "★".repeat(rounded) +
    "☆".repeat(5 - rounded)
  );
};

const decorateProduct = (
  product,
  statsMap
) => {
  const stats = statsMap[product.id] || {
    averageRating: 0,
    totalReviews: 0
  };

  return {
    ...product,
    href: `/products/${product.slug}`,
    priceDisplay: formatCurrency(product.price),
    oldPriceDisplay:
      product.oldPrice == null
        ? ""
        : formatCurrency(product.oldPrice),
    rating: stats.averageRating,
    reviewCount: stats.totalReviews,
    ratingStars: createStars(
      stats.averageRating
    ),
    imageAlt: product.alt
  };
};

const getDecoratedProducts = () => {
  const statsMap =
    reviewModel.getAllReviewStats();

  return products.map((product) =>
    decorateProduct(product, statsMap)
  );
};

const getAllProducts = () =>
  getDecoratedProducts();

const getProductById = (productId) =>
  getDecoratedProducts().find(
    (product) =>
      product.id === String(productId)
  ) || null;

const getProductBySlug = (slug) =>
  getDecoratedProducts().find(
    (product) =>
      product.slug === String(slug)
  ) || null;

const getProductByLegacyNumber = (
  legacyNumber
) => {
  const number = Number(legacyNumber);

  if (!Number.isInteger(number)) {
    return null;
  }

  return getDecoratedProducts().find(
    (product) =>
      product.featuredOrder === number
  ) || null;
};

const getRelatedProducts = (
  currentProductId,
  limit = 3
) => {
  const allProducts = getDecoratedProducts();

  const currentProduct = allProducts.find(
    (product) =>
      product.id === currentProductId
  );

  if (!currentProduct) {
    return [];
  }

  const sameCategory = allProducts.filter(
    (product) =>
      product.id !== currentProduct.id &&
      product.category ===
        currentProduct.category
  );

  const fallback = allProducts.filter(
    (product) =>
      product.id !== currentProduct.id &&
      product.category !==
        currentProduct.category
  );

  return [
    ...sameCategory,
    ...fallback
  ].slice(0, limit);
};

const categoryCounts = categories.reduce(
  (counts, category) => {
    counts[category.id] =
      category.id === "all"
        ? products.length
        : products.filter(
            (product) =>
              product.category === category.id
          ).length;

    return counts;
  },
  {}
);

const getProductsPageData = () => ({
  pageTitle: "Shop All",
  categories,
  categoryCounts,
  filters,
  sortOptions,
  products: getDecoratedProducts()
});

const getFeaturedProducts = (limit = 6) => {
  return products
    .filter((product) => product.stock > 0)
    .sort((a, b) => (a.featuredOrder || 999) - (b.featuredOrder || 999))
    .slice(0, limit)
    .map((product) => ({
      ...product,
      priceFormatted: `$${product.price.toFixed(2)}`,
      ratingStars:
        "★".repeat(Math.round(product.rating)) +
        "☆".repeat(5 - Math.round(product.rating))
    }));
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductByLegacyNumber,
  getProductBySlug,
  getProductsPageData,
  getRelatedProducts
};
