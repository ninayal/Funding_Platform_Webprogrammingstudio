"use strict";

const { createProduct } = require("./helpers");

module.exports = [
  createProduct({
  "id": "product-007",
  "category": "painting",
  "categoryLabel": "Painting",
  "maker": "Đông Hồ",
  "makerLocation": "Bắc Ninh",
  "material": "Printed paper",
  "name": "Vietnamese Folk Painting — Child with Carp",
  "price": 120,
  "oldPrice": null,
  "tag": "Only 3 left",
  "variant": "1 framed print",
  "availability": "low-stock",
  "stock": 3,
  "image": "/images/shopping_items/painting/painting_1.png",
  "alt": "Framed Vietnamese folk painting of a child holding a large carp",
  "featuredOrder": 7,
  "shortDescription": "A framed folk image inspired by Đông Hồ visual traditions and symbolic storytelling.",
  "longDescription": [
    "The child and carp motif communicates wishes for abundance, wellbeing and continuity. Strong outlines and flattened colour areas preserve the direct visual character of Vietnamese folk prints.",
    "The work arrives framed for display. Minor variation in paper surface and printed colour is normal for craft-based production."
  ],
  "sizes": [
    {
      "id": "framed",
      "label": "Framed",
      "isDefault": true
    }
  ],
  "makerNote": {
    "seal": "Đông Hồ",
    "quote": "The image is simple enough to read immediately, but its symbols continue beyond the first look.",
    "cite": "— Folk print workshop, Bắc Ninh"
  },
  "specifications": [
    {
      "label": "Material",
      "value": "Printed paper and frame"
    },
    {
      "label": "Tradition",
      "value": "Đông Hồ folk imagery"
    },
    {
      "label": "Format",
      "value": "Framed print"
    },
    {
      "label": "Care",
      "value": "Keep dry and out of direct sunlight"
    },
    {
      "label": "Origin",
      "value": "Made in Việt Nam"
    }
  ]
}),
  createProduct({
  "id": "product-008",
  "category": "painting",
  "categoryLabel": "Painting",
  "maker": "Đông Hồ",
  "makerLocation": "Bắc Ninh",
  "material": "Printed paper",
  "name": "Vietnamese Mother and Child Painting",
  "price": 16,
  "oldPrice": null,
  "tag": "",
  "variant": "1 framed print",
  "availability": "in-stock",
  "stock": 15,
  "image": "/images/shopping_items/painting/painting_2.png",
  "alt": "Framed Vietnamese painting of a mother holding her child",
  "featuredOrder": 8,
  "shortDescription": "A gentle framed image focused on closeness between a mother and child.",
  "longDescription": [
    "The composition uses a quiet, intimate pose to centre care and family connection. Its compact scale makes it suitable for desks, shelves and small gallery arrangements.",
    "The print is supplied in a simple frame. Keep it away from moisture and prolonged direct sunlight to preserve the paper and colour."
  ],
  "sizes": [
    {
      "id": "framed",
      "label": "Framed",
      "isDefault": true
    }
  ],
  "makerNote": {
    "seal": "Đông Hồ",
    "quote": "Family scenes remain meaningful because they are understood without explanation.",
    "cite": "— Print artisan, Bắc Ninh"
  },
  "specifications": [
    {
      "label": "Material",
      "value": "Printed paper and frame"
    },
    {
      "label": "Tradition",
      "value": "Vietnamese folk-inspired painting"
    },
    {
      "label": "Format",
      "value": "Framed print"
    },
    {
      "label": "Care",
      "value": "Keep dry and dust gently"
    },
    {
      "label": "Origin",
      "value": "Made in Việt Nam"
    }
  ]
})
];
