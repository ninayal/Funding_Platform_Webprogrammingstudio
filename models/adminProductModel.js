"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PRODUCTS_FILE = path.join(
    __dirname,
    "../data/products.json",
);

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
    const raw = fs.readFileSync(
        PRODUCTS_FILE,
        "utf8",
    );

    const products = JSON.parse(raw);

    return Array.isArray(products)
        ? products
        : [];
};

const writeProducts = (products) => {
    const tempFile = `${PRODUCTS_FILE}.tmp`;

    fs.writeFileSync(
        tempFile,
        `${JSON.stringify(products, null, 2)}\n`,
        "utf8",
    );

    fs.renameSync(
        tempFile,
        PRODUCTS_FILE,
    );
};

const getAllProducts = () =>
    readProducts().sort(
        (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt),
    );

const findProductById = (id) =>
    readProducts().find(
        (product) =>
            String(product.id) === String(id),
    ) || null;

const createProduct = (data) => {
    const products = readProducts();
    const now = new Date().toISOString();

    const product = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: now,
        updatedAt: now,
    };

    products.push(product);
    writeProducts(products);

    return product;
};

const updateProduct = (
    id,
    updates,
) => {
    const products = readProducts();

    const index = products.findIndex(
        (product) =>
            String(product.id) === String(id),
    );

    if (index === -1) {
        return null;
    }

    products[index] = {
        ...products[index],
        ...updates,
        updatedAt:
            new Date().toISOString(),
    };

    writeProducts(products);

    return products[index];
};

const deleteProduct = (id) => {
    const products = readProducts();

    const index = products.findIndex(
        (product) =>
            String(product.id) === String(id),
    );

    if (index === -1) {
        return null;
    }

    const [deleted] =
        products.splice(index, 1);

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