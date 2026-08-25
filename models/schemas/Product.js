"use strict";

const mongoose = require("mongoose");

const sizeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: "",
    },
    label: {
      type: String,
      default: "",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const makerNoteSchema = new mongoose.Schema(
  {
    seal: {
      type: String,
      default: "",
    },
    quote: {
      type: String,
      default: "",
    },
    cite: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const specificationSchema =
  new mongoose.Schema(
    {
      label: {
        type: String,
        default: "",
      },
      value: {
        type: String,
        default: "",
      },
    },
    {
      _id: false,
    }
  );

const productSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
    },

    images: {
      type: [String],
      default: [],
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },

    weightGram: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },

    status: {
      type: String,
      default: "published",
      index: true,
    },

    maker: {
      type: String,
      default: "",
      index: true,
    },

    makerLocation: {
      type: String,
      default: "",
    },

    material: {
      type: String,
      default: "",
      index: true,
    },

    tag: {
      type: String,
      default: "",
    },

    oldPrice: {
      type: Number,
      default: null,
      min: 0,
    },

    variant: {
      type: String,
      default: "Standard",
    },

    alt: {
      type: String,
      default: "",
    },

    featuredOrder: {
      type: Number,
      default: 999,
      index: true,
    },

    sizes: {
      type: [sizeSchema],
      default: [],
    },

    makerNote: {
      type: makerNoteSchema,
      default: null,
    },

    specifications: {
      type: [specificationSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "products",
  }
);

productSchema.index({
  status: 1,
  category: 1,
  featuredOrder: 1,
});

productSchema.index({
  status: 1,
  maker: 1,
});

productSchema.index({
  status: 1,
  material: 1,
});

productSchema.index({
  title: "text",
  description: "text",
  tag: "text",
});

module.exports =
  mongoose.models.Products ||
  mongoose.model(
    "Products",
    productSchema
  );