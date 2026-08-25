"use strict";

const mongoose = require("mongoose");

const forumNotificationSchema = new mongoose.Schema(
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

    type: {
      type: String,
      required: true,
    },

    threadSlug: {
      type: String,
      ref: "ForumThreads",
      required: true,
    },

    postId: {
      type: String,
      required: true,
    },

    actorId: {
      type: String,
      ref: "Users",
      required: true,
    },

    actorName: {
      type: String,
      required: true,
    },

    read: {
      type: Boolean,
      default: false,
      index: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "forumnotifications",
  }
);

forumNotificationSchema.index({
  userId: 1,
  read: 1,
  createdAt: -1,
});

module.exports =
  mongoose.models.ForumNotifications ||
  mongoose.model(
    "ForumNotifications",
    forumNotificationSchema
  );
