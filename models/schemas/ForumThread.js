"use strict";

const mongoose = require("mongoose");

// Forum posts stay embedded because the current forum module retrieves and
// mutates them through thread.posts (see models/forumModel.js).
const forumPostSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },

    author: {
      type: String,
      default: "",
    },

    authorId: {
      type: String,
      ref: "Users",
      default: null,
    },

    initials: {
      type: String,
      default: "",
    },

    rank: {
      type: String,
      default: "Member",
    },

    date: {
      type: String,
      default: "",
    },

    createdAt: {
      type: Date,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    editedAt: {
      type: Date,
      default: null,
    },

    parentPostId: {
      type: String,
      default: null,
    },

    likedBy: [
      {
        type: String,
        ref: "Users",
      },
    ],

    dislikedBy: [
      {
        type: String,
        ref: "Users",
      },
    ],

    bookmarkedBy: [
      {
        type: String,
        ref: "Users",
      },
    ],

    reportedBy: [
      {
        type: String,
        ref: "Users",
      },
    ],

    status: {
      type: String,
      enum: [
        "active",
        "deleted",
      ],
      default: "active",
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: String,
      ref: "Users",
      default: null,
    },
  },
  {
    _id: false,
  }
);

const forumThreadSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    authorId: {
      type: String,
      ref: "Users",
      default: null,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "published",
      ],
      default: "published",
      index: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    pinned: {
      type: Boolean,
      default: false,
    },

    locked: {
      type: Boolean,
      default: false,
    },

    hidden: {
      type: Boolean,
      default: false,
      index: true,
    },

    posts: {
      type: [forumPostSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "forumthreads",
  }
);

forumThreadSchema.index({
  status: 1,
  hidden: 1,
  category: 1,
  createdAt: -1,
});

forumThreadSchema.index({
  title: "text",
  "posts.content": "text",
  tags: "text",
});

forumThreadSchema.index({
  authorId: 1,
  createdAt: -1,
});

module.exports =
  mongoose.models.ForumThreads ||
  mongoose.model(
    "ForumThreads",
    forumThreadSchema
  );
