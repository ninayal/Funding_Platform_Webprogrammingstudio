"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const { createProduct: buildStorefrontProduct } = require("../data/products/helpers");

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

const CATEGORY_MATERIAL_DEFAULTS = {
    ceramics: "Glazed ceramic",
    painting: "Hand-painted lacquer",
    brocade: "Woven brocade",
    bamboo: "Woven bamboo",
    wood: "Carved wood",
    incense: "Natural incense",
    stone: "Fengshui Stone",
    waterpuppet: "Lacquered wood",
};

// Suggested values shown in the admin add/edit product form. Admins can still
// type a custom value — these just keep the shop's Material/Craft Village
// filters consistent with what's already in the catalog.
const CRAFT_VILLAGES = [
    "Bát Tràng",
    "Vạn Phúc",
    "Quảng Phú Cầu",
    "Đông Hồ",
    "Non Nước",
    "Đào Thục",
    "Đồng Kỵ",
    "Làng & Co. Workshop",
];

const MATERIALS = [
    "Glazed ceramic",
    "Painted ceramic",
    "Woven brocade",
    "Brocade textile",
    "Cinnamon incense",
    "Natural incense",
    "Printed paper",
    "Natural stone",
    "Jade-coloured stone",
    "Painted wood",
    "Carved wood",
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

const getCategoryLabel = (categoryValue) =>
    (CATEGORIES.find((category) => category.value === categoryValue) || {}).label
    || "Handmade";

const buildThumbnailsFromImages = (images, name) => {
    const gallery = images.filter(Boolean);

    if (gallery.length === 0) {
        return undefined;
    }

    return gallery.map((image, index) => ({
        image,
        alt: `${name}, photo ${index + 1}`,
    }));
};

const splitIntoParagraphs = (description) => {
    const paragraphs = String(description || "")
        .split(/\n\s*\n/)
        .map((part) => part.trim())
        .filter(Boolean);

    return paragraphs.length ? paragraphs : [String(description || "")];
};

// Converts an admin-managed product (data/products.json) into the same shape
// the shopping cart module expects from the storefront catalog, reusing that
// module's own createProduct() helper for defaulting so both simple
// admin-created products and richly-authored catalog entries stay consistent
// (slug, makerDisplay, sizes, meta, thumbnails). Products that already carry
// their own maker/material/specifications/etc. (migrated catalog entries)
// keep that authored content instead of the generic fallback.
const toStorefrontProduct = (product, index) => {
    const images = Array.isArray(product.images)
        ? product.images.filter(Boolean)
        : [];

    const categoryLabel = getCategoryLabel(product.category);
    const material = product.material || CATEGORY_MATERIAL_DEFAULTS[product.category] || "Handmade";
    const maker = product.maker || "Làng & Co. Workshop";
    const makerLocation = product.makerLocation || "Việt Nam";
    const priceUsd = Number(product.price);

    const shortDescription = product.shortDescription
        || (product.description.length > 200
            ? `${product.description.slice(0, 200).trim()}…`
            : product.description);

    const longDescription = Array.isArray(product.longDescription) && product.longDescription.length
        ? product.longDescription
        : splitIntoParagraphs(product.description);

    const specifications = Array.isArray(product.specifications) && product.specifications.length
        ? product.specifications
        : [
            { label: "Category", value: categoryLabel },
            { label: "Material", value: material },
            { label: "Packed weight", value: `${product.weightGram} g` },
            { label: "Stock", value: `${product.stock} available` },
        ];

    const makerNote = product.makerNote || {
        seal: "Làng & Co.",
        quote: "Every piece we add to the shop is chosen and checked by our team before it reaches you.",
        cite: "— Làng & Co. team",
    };

    return buildStorefrontProduct({
        id: product.id,
        category: product.category,
        categoryLabel,
        maker,
        makerLocation,
        material,
        name: product.title,
        price: priceUsd,
        oldPrice: product.oldPrice != null ? Number(product.oldPrice) : null,
        tag: product.tag || "",
        variant: product.variant || "Standard",
        availability:
            product.stock > 5
                ? "in-stock"
                : product.stock > 0
                    ? "low-stock"
                    : "out-of-stock",
        stock: product.stock,
        image: images[0] || "/images/logo.png",
        alt: product.alt || `${product.title} product photo`,
        featuredOrder: product.featuredOrder != null ? product.featuredOrder : 500 + index,
        shortDescription,
        longDescription,
        thumbnails: buildThumbnailsFromImages(images, product.title),
        sizes: product.sizes,
        makerNote,
        specifications,
    });
};

// Out-of-stock products stay admin-only; only items with stock left reach
// the live storefront/cart.
const getAvailableStorefrontProducts = () =>
    getAllProducts()
        .filter((product) => Number(product.stock) > 0)
        .map(toStorefrontProduct);

module.exports = {
    CATEGORIES,
    CRAFT_VILLAGES,
    MATERIALS,
    getAllProducts,
    findProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getAvailableStorefrontProducts,
};