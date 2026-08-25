"use strict";

const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
        },

        userId: {
            type: String,
            ref: "Users",
            required: true,
            unique: true,
            index: true,
        },
    },
    {
        timestamps: true,
        collection: "carts",
    }
);

cartSchema.index(
    {
        userId: 1,
    },
    {
        unique: true,
    }
);

module.exports = mongoose.model(
    "Carts",
    cartSchema
);