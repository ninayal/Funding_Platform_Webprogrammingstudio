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
