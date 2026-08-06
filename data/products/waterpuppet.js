"use strict";

const { createProduct } = require("./helpers");

module.exports = [
  createProduct({
  "id": "product-011",
  "category": "waterpuppet",
  "categoryLabel": "Water Puppets",
  "maker": "Đào Thục",
  "makerLocation": "Hanoi",
  "material": "Painted wood",
  "name": "Traditional Water Puppet — Royal Lady",
  "price": 72,
  "oldPrice": null,
  "tag": "",
  "variant": "1 puppet",
  "availability": "in-stock",
  "stock": 6,
  "image": "/images/shopping_items/waterpuppet/water1.png",
  "alt": "Traditional Vietnamese water puppet depicting a royal lady",
  "featuredOrder": 11,
  "shortDescription": "A painted wooden figure inspired by royal characters from Vietnamese water puppetry.",
  "longDescription": [
    "The figure translates a performance character into a display object while retaining the strong colours and simplified form associated with water puppetry.",
    "This item is intended for decoration and cultural display. Painted surfaces should be kept dry and protected from impacts."
  ],
  "sizes": [
    {
      "id": "single",
      "label": "1 puppet",
      "isDefault": true
    }
  ],
  "makerNote": {
    "seal": "Đào Thục",
    "quote": "A puppet must be readable from a distance, so colour and gesture carry the character.",
    "cite": "— Water puppet artisan, Đào Thục"
  },
  "specifications": [
    {
      "label": "Material",
      "value": "Painted wood"
    },
    {
      "label": "Craft village",
      "value": "Đào Thục, Hanoi"
    },
    {
      "label": "Character",
      "value": "Royal lady"
    },
    {
      "label": "Care",
      "value": "Keep dry; dust with a soft cloth"
    },
    {
      "label": "Origin",
      "value": "Handmade in Việt Nam"
    }
  ]
}),
  createProduct({
  "id": "product-012",
  "category": "waterpuppet",
  "categoryLabel": "Water Puppets",
  "maker": "Đào Thục",
  "makerLocation": "Hanoi",
  "material": "Painted wood",
  "name": "Traditional Water Puppet — Drum Performer",
  "price": 89,
  "oldPrice": null,
  "tag": "New",
  "variant": "1 puppet",
  "availability": "low-stock",
  "stock": 2,
  "image": "/images/shopping_items/waterpuppet/water2.png",
  "alt": "Traditional Vietnamese water puppet carrying a drum",
  "featuredOrder": 12,
  "shortDescription": "A lively painted wooden puppet portraying a traditional drum performer.",
  "longDescription": [
    "The figure captures a performance moment through a compact pose, bright paint and an immediately recognisable drum. It is designed as a display object referencing water puppet theatre.",
    "Each puppet is painted by hand, so facial details and colour boundaries vary slightly between finished pieces."
  ],
  "sizes": [
    {
      "id": "single",
      "label": "1 puppet",
      "isDefault": true
    }
  ],
  "makerNote": {
    "seal": "Đào Thục",
    "quote": "The drum gives the figure rhythm even when the puppet is standing still.",
    "cite": "— Water puppet workshop, Đào Thục"
  },
  "specifications": [
    {
      "label": "Material",
      "value": "Painted wood"
    },
    {
      "label": "Craft village",
      "value": "Đào Thục, Hanoi"
    },
    {
      "label": "Character",
      "value": "Drum performer"
    },
    {
      "label": "Care",
      "value": "Keep dry; avoid direct heat"
    },
    {
      "label": "Origin",
      "value": "Handmade in Việt Nam"
    }
  ]
})
];
