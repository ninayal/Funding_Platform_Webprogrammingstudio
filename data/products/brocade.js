"use strict";

const { createProduct } = require("./helpers");

module.exports = [
  createProduct({
  "id": "product-003",
  "category": "brocade",
  "categoryLabel": "Brocade",
  "maker": "Vạn Phúc",
  "makerLocation": "Hà Đông",
  "material": "Woven brocade",
  "name": "Brocade Blanket",
  "price": 56,
  "oldPrice": null,
  "tag": "New",
  "variant": "Set of 4",
  "availability": "in-stock",
  "stock": 12,
  "image": "/images/shopping_items/brocade/brocade1.png",
  "alt": "Stack of four folded traditional brocade blankets",
  "featuredOrder": 3,
  "shortDescription": "A richly patterned brocade blanket woven to bring texture and warmth into modern interiors.",
  "longDescription": [
    "The blanket combines repeating geometric motifs with a substantial woven texture. It can be used as a throw, decorative layer or folded accent at the end of a bed.",
    "Pattern alignment and colour intensity may vary slightly because of the woven construction. These variations make each finished textile distinctive."
  ],
  "sizes": [
    {
      "id": "standard",
      "label": "Standard",
      "isDefault": true
    }
  ],
  "makerNote": {
    "seal": "Vạn Phúc",
    "quote": "The pattern becomes visible one crossing of thread at a time.",
    "cite": "— Textile artisan, Vạn Phúc"
  },
  "specifications": [
    {
      "label": "Material",
      "value": "Woven brocade textile"
    },
    {
      "label": "Craft village",
      "value": "Vạn Phúc, Hà Đông"
    },
    {
      "label": "Use",
      "value": "Throw or decorative blanket"
    },
    {
      "label": "Care",
      "value": "Gentle cold wash; dry flat"
    },
    {
      "label": "Origin",
      "value": "Made in Việt Nam"
    }
  ]
}),
  createProduct({
  "id": "product-004",
  "category": "brocade",
  "categoryLabel": "Brocade",
  "maker": "Vạn Phúc",
  "makerLocation": "Hà Đông",
  "material": "Brocade textile",
  "name": "Handmade Brocade Horse Figurine",
  "price": 45,
  "oldPrice": 52,
  "tag": "Sale",
  "variant": "1 size",
  "availability": "low-stock",
  "stock": 3,
  "image": "/images/shopping_items/brocade/brocade2.png",
  "alt": "Colourful handmade horse figurine covered in traditional brocade patterns",
  "featuredOrder": 4,
  "shortDescription": "A soft decorative horse figurine assembled from colourful brocade panels.",
  "longDescription": [
    "The figurine uses small patterned textile sections to create a compact sculptural form. It is intended as a decorative object rather than a children's toy.",
    "Because pattern placement depends on the section of cloth selected by the maker, every horse presents a different combination of colours and motifs."
  ],
  "sizes": [
    {
      "id": "standard",
      "label": "Standard",
      "isDefault": true
    }
  ],
  "makerNote": {
    "seal": "Vạn Phúc",
    "quote": "Offcuts become useful again when they are joined into a new form.",
    "cite": "— Textile craft group, Vạn Phúc"
  },
  "specifications": [
    {
      "label": "Material",
      "value": "Brocade textile and soft filling"
    },
    {
      "label": "Craft village",
      "value": "Vạn Phúc, Hà Đông"
    },
    {
      "label": "Use",
      "value": "Decorative object"
    },
    {
      "label": "Care",
      "value": "Spot clean only"
    },
    {
      "label": "Origin",
      "value": "Handmade in Việt Nam"
    }
  ]
})
];
