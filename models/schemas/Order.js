"use strict";

const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
    {
        email: String,
        firstName: String,
        lastName: String,
        address1: String,
        address2: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
        phone: String,
    },
    {
        _id: false,
    }
);

const shippingSchema = new mongoose.Schema(
    {
        method: {
            type: String,
            default: "",
        },

        fee: {
            type: Number,
            min: 0,
            default: 0,
        },
    },
    {
        _id: false,
    }
);

const paymentSchema = new mongoose.Schema(
    {
        method: {
            type: String,
            default: "card",
        },

        cardName: {
            type: String,
            default: "",
        },

        cardLastFour: {
            type: String,
            default: "",
        },
    },
    {
        _id: false,
    }
);

const orderSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
        },

        userId: {
            type: String,
            ref: "Users",
            required: true,
            index: true,
        },

        delivery: {
            type: deliverySchema,
            required: true,
        },

        shipping: {
            type: shippingSchema,
            required: true,
        },

        payment: {
            type: paymentSchema,
            required: true,
        },

        giftNote: {
            type: String,
            default: "",
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },

        total: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            default: "confirmed",
            index: true,
        },
    },
    {
        timestamps: true,
        collection: "orders",
    }
);

orderSchema.index({
    userId: 1,
    createdAt: -1,
});

module.exports =
    mongoose.models.Orders ||
    mongoose.model("Orders", orderSchema);