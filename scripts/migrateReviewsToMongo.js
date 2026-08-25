"use strict";

require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");
const Review = require("../models/schemas/Review");

const reviewsPath = path.join(
  __dirname,
  "../data/reviews.json"
);

async function migrateReviews() {
  await mongoose.connect(process.env.MONGODB_URI);

  const reviews = JSON.parse(
    fs.readFileSync(reviewsPath, "utf8")
  );

  const documents = reviews.map(review => {
    const images = Array.isArray(review.images)
      ? review.images.filter(Boolean).slice(0, 3)
      : review.image
        ? [review.image]
        : [];

    return {
      _id: review.id,
      productId: String(review.productId),
      userId: String(review.userId),
      name: review.name || "",
      rating: Number(review.rating),
      title: review.title,
      comment: review.comment,
      images,
      dateAdded: review.dateAdded
        ? new Date(review.dateAdded)
        : new Date()
    };
  });

  for (const document of documents) {
    const { _id, ...data } = document;

    await Review.updateOne(
      { _id },
      {
        $set: data,
        $setOnInsert: { _id }
      },
      { upsert: true }
    );
  }

  console.log(
    `[Reviews] Migrated ${documents.length} reviews`
  );

  await mongoose.disconnect();
}

migrateReviews().catch(async error => {
  console.error("[Reviews] Migration failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});