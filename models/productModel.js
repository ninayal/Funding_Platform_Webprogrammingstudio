const products = require("../data/products");

const getAllProducts = () => {
  return products.map((product) => ({ ...product }));
};

const getProductById = (productId) => {
  return (
    products.find((product) => product.id === String(productId)) || null
  );
};

const getCategories = () => {
  const categoryMap = new Map();

  products.forEach((product) => {
    if (!categoryMap.has(product.category)) {
      categoryMap.set(product.category, {
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
    ...categoryMap.values(),
  ];
};

const getCategoryCounts = () => {
  const counts = {
    all: products.length,
  };

  products.forEach((product) => {
    counts[product.category] =
      (counts[product.category] || 0) + 1;
  });

  return counts;
};

const getFilterOptions = () => {
  const makers = [
    ...new Set(products.map((product) => product.maker)),
  ].sort();

  const materials = [
    ...new Set(products.map((product) => product.material)),
  ].sort();

  return {
    makers,
    materials,
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
        value: "4",
        label: "4 stars & up",
      },
      {
        value: "5",
        label: "5 stars only",
      },
    ],
  };
};

const getSortOptions = () => {
  return [
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
    {
      id: "rating",
      label: "Highest rated",
    },
  ];
};

const getProductsPageData = () => {
  return {
    pageTitle: "Shop All",
    products: getAllProducts(),
    categories: getCategories(),
    categoryCounts: getCategoryCounts(),
    filterOptions: getFilterOptions(),
    sortOptions: getSortOptions(),
  };
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductsPageData,
};