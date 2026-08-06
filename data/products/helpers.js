"use strict";

const slugify = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildThumbnails = (product) => {
  const labels = [
    "front view",
    "detail view",
    "side view",
    "styled view"
  ];

  return labels.map((label) => ({
    image: product.image,
    alt: `${product.name}, ${label}`
  }));
};

const createProduct = (input) => {
  const product = {
    ...input,
    slug: input.slug || slugify(input.name),
    makerDisplay: `${input.maker} · ${input.makerLocation}`,
    thumbnails:
      Array.isArray(input.thumbnails) && input.thumbnails.length
        ? input.thumbnails
        : buildThumbnails(input),
    meta:
      Array.isArray(input.meta) && input.meta.length
        ? input.meta
        : [
            `Stock available: ${input.stock}`,
            "Prepared and shipped from Việt Nam",
            "Packed with protective reused materials"
          ]
  };

  if (!Array.isArray(product.sizes) || product.sizes.length === 0) {
    product.sizes = [
      {
        id: "standard",
        label: product.variant || "Standard",
        isDefault: true
      }
    ];
  }

  return Object.freeze(product);
};

module.exports = {
  createProduct
};
