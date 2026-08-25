"use strict";

const mongoose = require("mongoose");

// The reset workflow starts from the user's email address, so this is a
// logical association with Users rather than a strict userId foreign key.
const resetSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "resolved",
        "rejected",
      ],
      default: "pending",
      index: true,
    },

    requestedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    tempPassword: {
      type: String,
      default: null,
    },
  },
  {
    collection: "passwordresetrequests",
  }
);

resetSchema.index({
  status: 1,
  requestedAt: -1,
});

resetSchema.index({
  email: 1,
  requestedAt: -1,
});

module.exports =
  mongoose.models.PasswordResetRequests ||
  mongoose.model(
    "PasswordResetRequests",
    resetSchema
  );
