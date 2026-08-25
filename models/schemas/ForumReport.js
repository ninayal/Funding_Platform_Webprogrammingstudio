"use strict";

const mongoose = require("mongoose");

const forumReportSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },

    threadSlug: {
      type: String,
      ref: "ForumThreads",
      required: true,
      index: true,
    },

    postId: {
      type: String,
      required: true,
      index: true,
    },

    reporterId: {
      type: String,
      ref: "Users",
      required: true,
      index: true,
    },

    reason: {
      type: String,
      required: true,
      maxlength: 500,
    },

    status: {
      type: String,
      enum: [
        "open",
        "resolved",
        "dismissed",
      ],
      default: "open",
      index: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "forumreports",
  }
);

forumReportSchema.index({
  status: 1,
  createdAt: -1,
});

forumReportSchema.index({
  reporterId: 1,
  createdAt: -1,
});

// Prevents the same user from reporting the same forum post more than once.
forumReportSchema.index(
  {
    threadSlug: 1,
    postId: 1,
    reporterId: 1,
  },
  {
    unique: true,
  }
);

module.exports =
  mongoose.models.ForumReports ||
  mongoose.model(
    "ForumReports",
    forumReportSchema
  );
