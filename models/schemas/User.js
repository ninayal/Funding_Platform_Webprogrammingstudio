"use strict";

const mongoose = require("mongoose");

const preferencesSchema = new mongoose.Schema(
  {
    emailUpdates: {
      type: Boolean,
      default: true,
    },

    orderNotifications: {
      type: Boolean,
      default: true,
    },

    communityReplies: {
      type: Boolean,
      default: false,
    },

    promotionalUpdates: {
      type: Boolean,
      default: true,
    },

    saveShippingInformation: {
      type: Boolean,
      default: true,
    },

    internationalShippingDefault: {
      type: Boolean,
      default: false,
    },

    productCareGuides: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
  }
);

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },

    firstname: {
      type: String,
      default: "",
      trim: true,
    },

    lastname: {
      type: String,
      default: "",
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "blocked", "deactivated"],
      default: "active",
      index: true,
    },

    phone: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    postalCode: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    about: {
      type: String,
      default: "",
    },

    avatar: {
      type: String,
      default: "/images/profile.png",
    },

    tier: {
      type: String,
      default: "Craft Collector",
    },

    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },

    joinDate: {
      type: Date,
      default: Date.now,
    },

    requiresPasswordChange: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

module.exports =
  mongoose.models.Users ||
  mongoose.model(
    "Users",
    userSchema
  );
