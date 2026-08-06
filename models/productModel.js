"use strict";

const products = require("../data/products");

const cloneProduct = (product) => ({ ...product });

const toArray = (value) => {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).map(String);
};

const getSelectedFilters = (query = {}) => ({
  price: toArray(query.price),
  maker: toArray(query.maker),
  material: toArray(query.material),
  availability: toArray(query.availability),
  rating: toArray(query.rating)
});

const matchesPrice = (price, selectedPrices) => {
  if (!selectedPrices.length) return true;

  return selectedPrices.some((range) => {
    if (range === "under-25") return price < 25;
    if (range === "25-50") return price >= 25 && price < 50;
    if (range === "50-100") return price >= 50 && price < 100;
    if (range === "100-plus") return price >= 100;
    return false;
  });
};

const matchesAvailability = (stock, selectedAvailability) => {
  if (!selectedAvailability.length) return true;

  return selectedAvailability.some((availability) => {
    if (availability === "in-stock") return stock > 5;
    if (availability === "low-stock") return stock > 0 && stock <= 5;
    return false;
  });
};

const matchesRating = (rating, selectedRatings) => {
  if (!selectedRatings.length) return true;

  return selectedRatings.some((value) => {
    const minimumRating = Number(value);

    if (!Number.isFinite(minimumRating)) return false;
    if (minimumRating === 5) return rating === 5;

    return rating >= minimumRating;
  });
};

const getFilteredProducts = (selectedFilters) => {
  return products
    .filter((product) => {
      const makerMatches =
        !selectedFilters.maker.length ||
        selectedFilters.maker.includes(product.maker);

      const materialMatches =
        !selectedFilters.material.length ||
        selectedFilters.material.includes(product.material);

      return (
        matchesPrice(product.price, selectedFilters.price) &&
        makerMatches &&
        materialMatches &&
        matchesAvailability(product.stock, selectedFilters.availability) &&
        matchesRating(product.rating, selectedFilters.rating)
      );
    })
    .map(cloneProduct);
};

const getAllProducts = () => {
  return products.map(cloneProduct);
};

const getProductById = (productId) => {
  return products.find(
    (product) => String(product.id) === String(productId)
  ) || null;
};

const getRecommendedProducts = (excludedIds = [], limit = 4) => {
  const excluded = new Set(excludedIds.map(String));

  return products
    .filter(
      (product) =>
        product.stock > 0 &&
        !excluded.has(String(product.id))
    )
    .sort(
      (a, b) =>
        (b.featuredOrder || 0) -
        (a.featuredOrder || 0)
    )
    .slice(0, limit)
    .map((product) => {
      const roundedRating = Math.max(
        0,
        Math.min(5, Math.round(product.rating))
      );

      return {
        ...cloneProduct(product),
        priceFormatted: `$${product.price.toFixed(2)}`,
        ratingStars:
          "★".repeat(roundedRating) +
          "☆".repeat(5 - roundedRating)
      };
    });
};

const getCategories = () => {
  const categoryMap = new Map();

  products.forEach((product) => {
    if (!categoryMap.has(product.category)) {
      categoryMap.set(product.category, {
        id: product.category,
        label: product.categoryLabel
      });
    }
  });

  return [
    { id: "all", label: "All" },
    ...categoryMap.values()
  ];
};

const getCategoryCounts = () => {
  const counts = { all: products.length };

  products.forEach((product) => {
    counts[product.category] =
      (counts[product.category] || 0) + 1;
  });

  return counts;
};

const getFilterOptions = () => ({
  makers: [
    ...new Set(
      products.map((product) => product.maker)
    )
  ].sort(),
  materials: [
    ...new Set(
      products.map((product) => product.material)
    )
  ].sort(),
  availability: [
    {
      value: "in-stock",
      label: "In stock"
    },
    {
      value: "low-stock",
      label: "Low stock"
    }
  ],
  ratings: [
    {
      value: "1",
      label: "1 star & up"
    },
    {
      value: "2",
      label: "2 stars & up"
    },
    {
      value: "3",
      label: "3 stars & up"
    },
    {
      value: "4",
      label: "4 stars & up"
    },
    {
      value: "5",
      label: "5 stars only"
    }
  ]
});

const getSortOptions = () => [
  {
    id: "featured",
    label: "Best Sellers"
  },
  {
    id: "price-low",
    label: "Price: Low to high"
  },
  {
    id: "price-high",
    label: "Price: High to low"
  },
  {
    id: "name",
    label: "Name: A–Z"
  }
];

const getProductsPageData = (query = {}) => {
  const selectedFilters = getSelectedFilters(query);
  const filteredProducts = getFilteredProducts(selectedFilters);

  return {
    pageTitle: "Shop All",
    products: filteredProducts,
    categories: getCategories(),
    categoryCounts: getCategoryCounts(),
    filterOptions: getFilterOptions(),
    sortOptions: getSortOptions(),
    selectedFilters
  };
};

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
  getRecommendedProducts,
  getProductsPageData,
  getFeaturedProducts
};
