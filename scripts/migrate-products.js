"use strict";

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const { connectDB } = require("../config/db");
const Product = require("../models/schemas/Product");

const PRODUCTS_FILE = path.join(
    __dirname,
    "../data/products.json"
);

const migrateProducts = async () => {
    try {
        await connectDB();

        const raw = fs.readFileSync(
            PRODUCTS_FILE,
            "utf8"
        );

        const products = JSON.parse(raw);

        if (!Array.isArray(products)) {
            throw new Error(
                "products.json must contain an array."
            );
        }

        for (const product of products) {
            const {
                id,
                createdAt,
                updatedAt,
                ...data
            } = product;

            await Product.findOneAndUpdate(
                {
                    _id: String(id),
                },
                {
                    $set: data,
                    $setOnInsert: {
                        createdAt:
                            createdAt || new Date(),
                    },
                },
                {
                    upsert: true,
                    runValidators: true,
                }
            );
        }

        const count =
            await Product.countDocuments();

        console.log(
            `[Migration] ${products.length} products migrated.`
        );

        console.log(
            `[MongoDB] ${count} products currently stored.`
        );
    } catch (error) {
        console.error(
            "[Migration] Failed:",
            error.message
        );

        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

migrateProducts();