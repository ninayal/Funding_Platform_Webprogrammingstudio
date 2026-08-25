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
        },
    },
    {
        timestamps: true,
        collection: "carts",
    }
);

module.exports =
    mongoose.models.Carts ||
    mongoose.model(
        "Carts",
        cartSchema
    );