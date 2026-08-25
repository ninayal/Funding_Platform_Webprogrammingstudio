"use strict";

const adminProductModel =
  require("./adminProductModel");

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);

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

const toArray = (value) => {
  if (!value) return [];

  return (
    Array.isArray(value)
      ? value
      : [value]
  ).map(String);
};

const getBaseProducts = async () => {
  const products =
    await adminProductModel
      .getAvailableStorefrontProducts();

  return products.sort(
    (a, b) =>
      (a.featuredOrder || 999) -
      (b.featuredOrder || 999)
  );
};

const decorateProduct = (
  product,
  statsMap = {}
) => {
  const stats =
    statsMap[String(product.id)] || {
      averageRating: 0,
      totalReviews: 0,
    };

  const href =
    `/products/${product.slug}`;

  return {
    ...product,
    href,
    reviewHref:
      `${href}?tab=review`,

    priceDisplay:
      formatCurrency(product.price),

    priceFormatted:
      formatCurrency(product.price),

    oldPriceDisplay:
      product.oldPrice == null
        ? ""
        : formatCurrency(
          product.oldPrice
        ),

    oldPriceFormatted:
      product.oldPrice == null
        ? null
        : formatCurrency(
          product.oldPrice
        ),

    rating:
      stats.averageRating,

    reviewCount:
      stats.totalReviews,

    ratingStars:
      createStars(
        stats.averageRating
      ),

    imageAlt:
      product.alt ||
      product.name,
  };
};

const getDecoratedProducts = async (
  statsMap = {}
) => {
  const products =
    await getBaseProducts();

  return products.map(
    (product) =>
      decorateProduct(
        product,
        statsMap
      )
  );
};

const getSelectedFilters = (
  query = {}
) => ({
  price: toArray(query.price),
  maker: toArray(query.maker),
  material:
    toArray(query.material),
  availability:
    toArray(query.availability),
  rating: toArray(query.rating),
});

const matchesPrice = (
  price,
  selected
) => {
  if (!selected.length) return true;

  return selected.some((range) => {
    if (range === "under-25") {
      return price < 25;
    }

    if (range === "25-50") {
      return (
        price >= 25 &&
        price < 50
      );
    }

    if (range === "50-100") {
      return (
        price >= 50 &&
        price < 100
      );
    }

    if (range === "100-plus") {
      return price >= 100;
    }

    return false;
  });
};

const matchesAvailability = (
  stock,
  selected
) => {
  if (!selected.length) return true;

  return selected.some((value) => {
    if (value === "in-stock") {
      return stock > 5;
    }

    if (value === "low-stock") {
      return (
        stock > 0 &&
        stock <= 5
      );
    }

    return false;
  });
};

const matchesRating = (
  rating,
  selected
) => {
  if (!selected.length) return true;

  return selected.some((value) => {
    const minimum =
      Number(value);

    if (!Number.isFinite(minimum)) {
      return false;
    }

    return minimum === 5
      ? rating === 5
      : rating >= minimum;
  });
};

const filterProducts = (
  products,
  filters
) =>
  products.filter((product) => {
    const makerMatches =
      !filters.maker.length ||
      filters.maker.includes(
        product.maker
      );

    const materialMatches =
      !filters.material.length ||
      filters.material.includes(
        product.material
      );

    return (
      matchesPrice(
        product.price,
        filters.price
      ) &&
      makerMatches &&
      materialMatches &&
      matchesAvailability(
        product.stock,
        filters.availability
      ) &&
      matchesRating(
        product.rating,
        filters.rating
      )
    );
  });

const buildCategories = (
  products
) => {
  const categories = new Map();

  products.forEach((product) => {
    if (
      !categories.has(
        product.category
      )
    ) {
      categories.set(
        product.category,
        {
          id: product.category,
          label:
            product.categoryLabel,
        }
      );
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

const buildCategoryCounts = (
  products
) => {
  const counts = {
    all: products.length,
  };

  products.forEach((product) => {
    counts[product.category] =
      (counts[
        product.category
      ] || 0) + 1;
  });

  return counts;
};

const buildFilterOptions = (
  products
) => ({
  makers: [
    ...new Set(
      products.map(
        (product) =>
          product.maker
      )
    ),
  ].sort(),

  materials: [
    ...new Set(
      products.map(
        (product) =>
          product.material
      )
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

/* =========================
   PUBLIC QUERIES
========================= */

const getAllProducts = async (
  statsMap = {}
) =>
  getDecoratedProducts(statsMap);

const getProductById = async (
  productId,
  statsMap = {}
) => {
  const products =
    await getDecoratedProducts(
      statsMap
    );

  return (
    products.find(
      (product) =>
        String(product.id) ===
        String(productId)
    ) || null
  );
};

const getProductBySlug = async (
  slug,
  statsMap = {}
) => {
  const products =
    await getDecoratedProducts(
      statsMap
    );

  return (
    products.find(
      (product) =>
        String(product.slug) ===
        String(slug)
    ) || null
  );
};

const getProductByLegacyNumber =
  async (
    legacyNumber,
    statsMap = {}
  ) => {
    const number =
      Number(legacyNumber);

    if (
      !Number.isInteger(number)
    ) {
      return null;
    }

    const products =
      await getDecoratedProducts(
        statsMap
      );

    return (
      products.find(
        (product) =>
          product.featuredOrder ===
          number
      ) || null
    );
  };

const getRecommendedProducts =
  async (
    excludedIds = [],
    limit = 4,
    statsMap = {}
  ) => {
    const products =
      await getDecoratedProducts(
        statsMap
      );

    const excluded = new Set(
      excludedIds.map(String)
    );

    return products
      .filter(
        (product) =>
          product.stock > 0 &&
          !excluded.has(
            String(product.id)
          )
      )
      .sort(
        (a, b) =>
          (b.featuredOrder || 0) -
          (a.featuredOrder || 0)
      )
      .slice(0, limit);
  };

const getProductsPageData =
  async (
    query = {},
    statsMap = {}
  ) => {
    const baseProducts =
      await getBaseProducts();

    const products =
      baseProducts.map(
        (product) =>
          decorateProduct(
            product,
            statsMap
          )
      );

    const selectedFilters =
      getSelectedFilters(query);

    return {
      pageTitle: "Shop All",

      products:
        filterProducts(
          products,
          selectedFilters
        ),

      categories:
        buildCategories(
          baseProducts
        ),

      categoryCounts:
        buildCategoryCounts(
          baseProducts
        ),

      filterOptions:
        buildFilterOptions(
          baseProducts
        ),

      sortOptions:
        getSortOptions(),

      selectedFilters,
    };
  };

const getFeaturedProducts =
  async (
    limit = 6,
    statsMap = {}
  ) => {
    const products =
      await getDecoratedProducts(
        statsMap
      );

    return products
      .filter(
        (product) =>
          product.stock > 0
      )
      .sort(
        (a, b) =>
          (a.featuredOrder || 999) -
          (b.featuredOrder || 999)
      )
      .slice(0, limit);
  };

const getRelatedProducts =
  async (
    currentProductId,
    limit = 3,
    statsMap = {}
  ) => {
    const products =
      await getDecoratedProducts(
        statsMap
      );

    const current =
      products.find(
        (product) =>
          String(product.id) ===
          String(currentProductId)
      );

    if (!current) return [];

    const sameCategory =
      products.filter(
        (product) =>
          product.id !==
          current.id &&
          product.category ===
          current.category
      );

    const fallback =
      products.filter(
        (product) =>
          product.id !==
          current.id &&
          product.category !==
          current.category
      );

    return [
      ...sameCategory,
      ...fallback,
    ].slice(0, limit);
  };

module.exports = {
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  getProductByLegacyNumber,
  getProductBySlug,
  getProductsPageData,
  getRecommendedProducts,
  getRelatedProducts,
  getSortOptions,
};