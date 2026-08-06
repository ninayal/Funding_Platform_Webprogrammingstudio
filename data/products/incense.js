"use strict";

const { createProduct } = require("./helpers");

module.exports = [
  createProduct({
  "id": "product-005",
  "category": "incense",
  "categoryLabel": "Incense",
  "maker": "Quảng Phú Cầu",
  "makerLocation": "Hanoi",
  "material": "Cinnamon incense",
  "name": "Hand-Rolled Cinnamon Incense Bundle",
  "price": 34,
  "oldPrice": null,
  "tag": "",
  "variant": "Set of 3 bundles",
  "availability": "in-stock",
  "stock": 20,
  "image": "/images/shopping_items/incense/incense1.png",
  "alt": "Three bundles of hand-rolled cinnamon incense sticks",
  "featuredOrder": 5,
  "shortDescription": "Three bundles of warm cinnamon incense rolled and dried in Quảng Phú Cầu.",
  "longDescription": [
    "The incense is made for a warm, gently spiced atmosphere. Each bundle is tied for storage and can be separated into individual sticks as needed.",
    "Natural ingredients can create small differences in colour, texture and burn time. Always use incense in a stable holder and in a ventilated space."
  ],
  "sizes": [
    {
      "id": "set-3",
      "label": "3 bundles",
      "isDefault": true
    }
  ],
  "makerNote": {
    "seal": "Quảng Phú Cầu",
    "quote": "Drying slowly helps the sticks keep an even fragrance from beginning to end.",
    "cite": "— Incense maker, Quảng Phú Cầu"
  },
  "specifications": [
    {
      "label": "Material",
      "value": "Cinnamon-based incense"
    },
    {
      "label": "Craft village",
      "value": "Quảng Phú Cầu, Hanoi"
    },
    {
      "label": "Set contents",
      "value": "3 tied bundles"
    },
    {
      "label": "Safety",
      "value": "Burn only in a suitable holder"
    },
    {
      "label": "Origin",
      "value": "Made in Việt Nam"
    }
  ]
}),
  createProduct({
  "id": "product-006",
  "category": "incense",
  "categoryLabel": "Incense",
  "maker": "Quảng Phú Cầu",
  "makerLocation": "Hanoi",
  "material": "Natural incense",
  "name": "Natural Incense Cone Gift Set",
  "price": 38,
  "oldPrice": null,
  "tag": "",
  "variant": "24 cones",
  "availability": "in-stock",
  "stock": 14,
  "image": "/images/shopping_items/incense/incense2.png",
  "alt": "Natural brown incense cones in a metal gift tin",
  "featuredOrder": 6,
  "shortDescription": "A compact tin of natural incense cones prepared as a practical gift set.",
  "longDescription": [
    "The cones provide a simple alternative to incense sticks and are packaged for storage between uses. Their natural brown surface reflects the ingredients rather than artificial colouring.",
    "Place one cone on a heat-safe incense plate, keep it away from flammable materials and never leave it burning unattended."
  ],
  "sizes": [
    {
      "id": "24-cones",
      "label": "24 cones",
      "isDefault": true
    }
  ],
  "makerNote": {
    "seal": "Quảng Phú Cầu",
    "quote": "A small cone can hold the same careful preparation as a full incense stick.",
    "cite": "— Incense workshop, Quảng Phú Cầu"
  },
  "specifications": [
    {
      "label": "Material",
      "value": "Natural incense blend"
    },
    {
      "label": "Craft village",
      "value": "Quảng Phú Cầu, Hanoi"
    },
    {
      "label": "Quantity",
      "value": "24 cones"
    },
    {
      "label": "Packaging",
      "value": "Reusable metal tin"
    },
    {
      "label": "Origin",
      "value": "Made in Việt Nam"
    }
  ]
})
];
