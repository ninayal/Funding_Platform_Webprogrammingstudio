"use strict";

const products = require(
  "../data/products"
);

const reviewModel = require(
  "./reviewModel"
);

const cloneProduct = (
  product
) => ({
  ...product
});

const toArray = (
  value
) => {
  if (!value) {
    return [];
  }

  return (
    Array.isArray(value)
      ? value
      : [value]
  ).map(String);
};

const formatCurrency = (
  value
) =>
  new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",
      currency:
        "USD"
    }
  ).format(
    Number(value) || 0
  );

const createStars = (
  rating
) => {
  const roundedRating =
    Math.max(
      0,
      Math.min(
        5,
        Math.round(
          Number(rating) || 0
        )
      )
    );

  return (
    "★".repeat(
      roundedRating
    ) +
    "☆".repeat(
      5 - roundedRating
    )
  );
};

const decorateProduct = (
  product,
  statsMap
) => {
  const reviewStats =
    statsMap[
      String(product.id)
    ] || {
      averageRating:
        0,
      totalReviews:
        0
    };

  const href =
    `/products/${product.slug}`;

  return {
    ...cloneProduct(product),

    href,

    reviewHref:
      `${href}?tab=review`,

    priceDisplay:
      formatCurrency(
        product.price
      ),

    priceFormatted:
      formatCurrency(
        product.price
      ),

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
      reviewStats.averageRating,

    reviewCount:
      reviewStats.totalReviews,

    ratingStars:
      createStars(
        reviewStats.averageRating
      ),

    imageAlt:
      product.alt ||
      product.name
  };
};

const getDecoratedProducts = () => {
  const statsMap =
    reviewModel.getAllReviewStats();

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
  price:
    toArray(
      query.price
    ),

  maker:
    toArray(
      query.maker
    ),

  material:
    toArray(
      query.material
    ),

  availability:
    toArray(
      query.availability
    ),

  rating:
    toArray(
      query.rating
    )
});

const matchesPrice = (
  price,
  selectedPrices
) => {
  if (
    !selectedPrices.length
  ) {
    return true;
  }

  return selectedPrices.some(
    (range) => {
      if (
        range === "under-25"
      ) {
        return price < 25;
      }

      if (
        range === "25-50"
      ) {
        return (
          price >= 25 &&
          price < 50
        );
      }

      if (
        range === "50-100"
      ) {
        return (
          price >= 50 &&
          price < 100
        );
      }

      if (
        range === "100-plus"
      ) {
        return price >= 100;
      }

      return false;
    }
  );
};

const matchesAvailability = (
  stock,
  selectedAvailability
) => {
  if (
    !selectedAvailability.length
  ) {
    return true;
  }

  return selectedAvailability.some(
    (availability) => {
      if (
        availability ===
        "in-stock"
      ) {
        return stock > 5;
      }

      if (
        availability ===
        "low-stock"
      ) {
        return (
          stock > 0 &&
          stock <= 5
        );
      }

      return false;
    }
  );
};

const matchesRating = (
  rating,
  selectedRatings
) => {
  if (
    !selectedRatings.length
  ) {
    return true;
  }

  return selectedRatings.some(
    (value) => {
      const minimumRating =
        Number(value);

      if (
        !Number.isFinite(
          minimumRating
        )
      ) {
        return false;
      }

      if (
        minimumRating === 5
      ) {
        return rating === 5;
      }

      return (
        rating >=
        minimumRating
      );
    }
  );
};

const getFilteredProducts = (
  selectedFilters
) =>
  getDecoratedProducts()
    .filter(
      (product) => {
        const makerMatches =
          !selectedFilters
            .maker.length ||
          selectedFilters
            .maker.includes(
              product.maker
            );

        const materialMatches =
          !selectedFilters
            .material.length ||
          selectedFilters
            .material.includes(
              product.material
            );

        return (
          matchesPrice(
            product.price,
            selectedFilters.price
          ) &&
          makerMatches &&
          materialMatches &&
          matchesAvailability(
            product.stock,
            selectedFilters
              .availability
          ) &&
          matchesRating(
            product.rating,
            selectedFilters.rating
          )
        );
      }
    );

const getAllProducts = () =>
  getDecoratedProducts();

const getProductById = (
  productId
) =>
  getDecoratedProducts()
    .find(
      (product) =>
        String(product.id) ===
        String(productId)
    ) || null;

const getProductBySlug = (
  slug
) =>
  getDecoratedProducts()
    .find(
      (product) =>
        String(product.slug) ===
        String(slug)
    ) || null;

const getProductByLegacyNumber = (
  legacyNumber
) => {
  const number =
    Number(legacyNumber);

  if (
    !Number.isInteger(number)
  ) {
    return null;
  }

  return (
    getDecoratedProducts()
      .find(
        (product) =>
          product.featuredOrder ===
          number
      ) || null
  );
};

const getRecommendedProducts = (
  excludedIds = [],
  limit = 4
) => {
  const excluded =
    new Set(
      excludedIds.map(String)
    );

  return getDecoratedProducts()
    .filter(
      (product) =>
        product.stock > 0 &&
        !excluded.has(
          String(product.id)
        )
    )
    .sort(
      (first, second) =>
        (
          second.featuredOrder ||
          0
        ) -
        (
          first.featuredOrder ||
          0
        )
    )
    .slice(
      0,
      limit
    );
};

const getCategories = () => {
  const categoryMap =
    new Map();

  products.forEach(
    (product) => {
      if (
        !categoryMap.has(
          product.category
        )
      ) {
        categoryMap.set(
          product.category,
          {
            id:
              product.category,

            label:
              product.categoryLabel
          }
        );
      }
    }
  );

  return [
    {
      id:
        "all",
      label:
        "All"
    },
    ...categoryMap.values()
  ];
};

const getCategoryCounts = () => {
  const counts = {
    all:
      products.length
  };

  products.forEach(
    (product) => {
      counts[
        product.category
      ] =
        (
          counts[
            product.category
          ] || 0
        ) + 1;
    }
  );

  return counts;
};

const getFilterOptions = () => ({
  makers: [
    ...new Set(
      products.map(
        (product) =>
          product.maker
      )
    )
  ].sort(),

  materials: [
    ...new Set(
      products.map(
        (product) =>
          product.material
      )
    )
  ].sort(),

  availability: [
    {
      value:
        "in-stock",
      label:
        "In stock"
    },
    {
      value:
        "low-stock",
      label:
        "Low stock"
    }
  ],

  ratings: [
    {
      value:
        "1",
      label:
        "1 star & up"
    },
    {
      value:
        "2",
      label:
        "2 stars & up"
    },
    {
      value:
        "3",
      label:
        "3 stars & up"
    },
    {
      value:
        "4",
      label:
        "4 stars & up"
    },
    {
      value:
        "5",
      label:
        "5 stars only"
    }
  ]
});

const getSortOptions = () => [
  {
    id:
      "featured",
    label:
      "Best Sellers"
  },
  {
    id:
      "price-low",
    label:
      "Price: Low to high"
  },
  {
    id:
      "price-high",
    label:
      "Price: High to low"
  },
  {
    id:
      "name",
    label:
      "Name: A–Z"
  }
];

const getProductsPageData = (
  query = {}
) => {
  const selectedFilters =
    getSelectedFilters(
      query
    );

  return {
    pageTitle:
      "Shop All",

    products:
      getFilteredProducts(
        selectedFilters
      ),

    categories:
      getCategories(),

    categoryCounts:
      getCategoryCounts(),

    filterOptions:
      getFilterOptions(),

    sortOptions:
      getSortOptions(),

    selectedFilters
  };
};

const getFeaturedProducts = (
  limit = 6
) =>
  getDecoratedProducts()
    .filter(
      (product) =>
        product.stock > 0
    )
    .sort(
      (first, second) =>
        (
          first.featuredOrder ||
          999
        ) -
        (
          second.featuredOrder ||
          999
        )
    )
    .slice(
      0,
      limit
    );

const getRelatedProducts = (
  currentProductId,
  limit = 3
) => {
  const allProducts =
    getDecoratedProducts();

  const currentProduct =
    allProducts.find(
      (product) =>
        String(product.id) ===
        String(currentProductId)
    );

  if (!currentProduct) {
    return [];
  }

  const sameCategory =
    allProducts.filter(
      (product) =>
        product.id !==
          currentProduct.id &&
        product.category ===
          currentProduct.category
    );

  const fallback =
    allProducts.filter(
      (product) =>
        product.id !==
          currentProduct.id &&
        product.category !==
          currentProduct.category
    );

  return [
    ...sameCategory,
    ...fallback
  ].slice(
    0,
    limit
  );
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
  getSortOptions
};
const fs = require("fs");
const path = require("path");

const productsFilePath = path.join(__dirname, "..", "data", "products.json");

const CATEGORIES = [
  { value: "ceramics", label: "Ceramics" },
  { value: "painting", label: "Painting" },
  { value: "brocade", label: "Brocade" },
  { value: "bamboo", label: "Bamboo" },
  { value: "wood", label: "Wood" },
  { value: "incense", label: "Incense" },
  { value: "stone", label: "Fengshui Stone" },
  { value: "waterpuppet", label: "Water Puppets" },
];

const readProducts = () => {
  const raw = fs.readFileSync(productsFilePath, "utf-8");
  return JSON.parse(raw);
};

const writeProducts = (products) => {
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
};

const getAllProducts = () => {
  return readProducts().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const findProductById = (id) => {
  return readProducts().find((product) => product.id === id) || null;
};

const createProduct = (data) => {
  const products = readProducts();
  const now = new Date().toISOString();
  const product = {
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  products.push(product);
  writeProducts(products);
  return product;
};

const updateProduct = (id, updates) => {
  const products = readProducts();
  const index = products.findIndex((product) => product.id === id);

  if (index === -1) {
    return null;
  }

  products[index] = {
    ...products[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeProducts(products);
  return products[index];
};

const deleteProduct = (id) => {
  const products = readProducts();
  const index = products.findIndex((product) => product.id === id);

  if (index === -1) {
    return null;
  }

  const [deleted] = products.splice(index, 1);
  writeProducts(products);
  return deleted;
};

module.exports = {
  CATEGORIES,
  getAllProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
