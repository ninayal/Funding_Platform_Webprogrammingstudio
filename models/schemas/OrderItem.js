"use strict";

const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            ref: "Orders",
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

        giftcardId: {
            type: String,
            ref: "GiftCards",
            default: null,
            index: true,
        },

        title: {
            type: String,
            required: true,
        },

        image: {
            type: String,
            default: "",
        },

        maker: {
            type: String,
            default: "",
        },

        material: {
            type: String,
            default: "",
        },

        variant: {
            type: String,
            default: "",
        },

        unitPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        lineTotal: {
            type: Number,
            required: true,
            min: 0,
        },

        giftcardCode: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: false,
        collection: "orderitems",
    }
);

orderItemSchema.index({
    orderId: 1,
});

orderItemSchema.index({
    productId: 1,
});

orderItemSchema.index({
    giftcardId: 1,
});

module.exports =
    mongoose.models.OrderItems ||
    mongoose.model("OrderItems", orderItemSchema);