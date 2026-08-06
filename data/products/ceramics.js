"use strict";

const { createProduct } = require("./helpers");

module.exports = [
  createProduct({
  "id": "product-001",
  "category": "ceramics",
  "categoryLabel": "Ceramics",
  "maker": "Bát Tràng",
  "makerLocation": "Hanoi",
  "material": "Glazed ceramic",
  "name": "Sculpted Face Ceramic Mug",
  "price": 68,
  "oldPrice": null,
  "tag": "Bestseller",
  "variant": "2 sizes",
  "availability": "in-stock",
  "stock": 10,
  "image": "/images/shopping_items/ceramic/ceramic1.png",
  "alt": "Cream ceramic mug sculpted with a face and pink bow",
  "featuredOrder": 1,
  "shortDescription": "A playful hand-sculpted mug shaped and glazed by ceramic artisans in Bát Tràng.",
  "longDescription": [
    "Each mug is shaped by hand, then finished with expressive facial details before glazing. Small differences in the eyes, lips and bow are evidence of the maker's hand rather than manufacturing defects.",
    "The glazed ceramic body is designed for everyday display and use. Because the piece is handmade, colour, texture and exact dimensions can vary slightly between mugs."
  ],
  "sizes": [
    {
      "id": "350ml",
      "label": "350 ml",
      "isDefault": true
    },
    {
      "id": "450ml",
      "label": "450 ml",
      "isDefault": false
    }
  ],
  "makerNote": {
    "seal": "Bát Tràng",
    "quote": "The expression changes slightly every time the clay passes through a different pair of hands.",
    "cite": "— Ceramic workshop team, Bát Tràng"
  },
  "specifications": [
    {
      "label": "Material",
      "value": "Glazed ceramic"
    },
    {
      "label": "Craft village",
      "value": "Bát Tràng, Hanoi"
    },
    {
      "label": "Capacity",
      "value": "350 ml or 450 ml"
    },
    {
      "label": "Care",
      "value": "Hand wash recommended"
    },
    {
      "label": "Origin",
      "value": "Handmade in Việt Nam"
    }
  ]
}),
  createProduct({
  "id": "product-002",
  "category": "ceramics",
  "categoryLabel": "Ceramics",
  "maker": "Bát Tràng",
  "makerLocation": "Hanoi",
  "material": "Painted ceramic",
  "name": "Hand-Painted Ribbon Ceramic Mug Set",
  "price": 54,
  "oldPrice": null,
  "tag": "",
  "variant": "Set of 8",
  "availability": "in-stock",
  "stock": 8,
  "image": "/images/shopping_items/ceramic/ceramic2.png",
  "alt": "Set of hand-painted ceramic mugs decorated with ribbons and flowers",
  "featuredOrder": 2,
  "shortDescription": "A coordinated set of small ceramic mugs painted with ribbons, flowers, hearts and cherries.",
  "longDescription": [
    "The motifs are painted individually, so each mug belongs to the same visual family without being an exact duplicate. The set works for tea, coffee or a colourful shelf display.",
    "The mugs are fired and glazed in Bát Tràng. Slight differences in brush pressure and placement are normal characteristics of the hand-painted finish."
  ],
  "sizes": [
    {
      "id": "set-8",
      "label": "Set of 8",
      "isDefault": true
    }
  ],
  "makerNote": {
    "seal": "Bát Tràng",
    "quote": "A set should feel connected, but every cup should still carry its own small character.",
    "cite": "— Decorative painting team, Bát Tràng"
  },
  "specifications": [
    {
      "label": "Material",
      "value": "Painted and glazed ceramic"
    },
    {
      "label": "Craft village",
      "value": "Bát Tràng, Hanoi"
    },
    {
      "label": "Set contents",
      "value": "8 assorted mugs"
    },
    {
      "label": "Care",
      "value": "Hand wash recommended"
    },
    {
      "label": "Origin",
      "value": "Handmade in Việt Nam"
    }
  ]
})
];
