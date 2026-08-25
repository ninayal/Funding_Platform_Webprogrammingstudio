"use strict";

const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
    {
        cartId: {
            type: String,
            ref: "Carts",
            required: true,
            index: true,
        },

        itemType: {
            type: String,
            enum: ["product", "giftcard"],
            required: true,
            index: true,
        },

        productId: {
            type: String,
            ref: "Products",
            default: null,
            index: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        giftcardDraft: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
    },
    {
        timestamps: true,
        collection: "cartitems",
    }
);

cartItemSchema.index({
    cartId: 1,
    itemType: 1,
});

cartItemSchema.index({
    cartId: 1,
    productId: 1,
});

module.exports =
    mongoose.models.CartItems ||
    mongoose.model("CartItems", cartItemSchema);