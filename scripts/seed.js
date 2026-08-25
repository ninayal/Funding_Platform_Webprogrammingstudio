"use strict";

require("dotenv").config();
const mongoose = require("mongoose");

const Users = require("../models/schemas/User");
const PasswordResetRequests = require("../models/schemas/PasswordResetRequest");
const ForumThreads = require("../models/schemas/ForumThread");
const ForumReports = require("../models/schemas/ForumReport");
const ForumNotifications = require("../models/schemas/ForumNotification");

const rawUsers = require("../data/users.json");
const rawPasswordResets = require("../data/passwordResetRequests.json");
const { threads: seedThreads } = require("../data/forum.js");
const forumStorage = require("../data/forum-storage.json");

// This script only seeds the shared group (Users, PasswordResetRequests) and
// the forum group (ForumThreads, ForumReports, ForumNotifications). Products,
// carts, and orders already live in Atlas and are managed elsewhere — this
// script never touches those collections.

// Mirrors the mergeThreads() logic the old in-memory forumModel.js used to run
// at startup: a stored thread overrides the seed thread with the same slug,
// and anything in deletedThreadSlugs is dropped from both sources.
const mergeThreads = (deletedSlugs, storedThreads) => {
  const deleted = new Set(deletedSlugs);
  const bySlug = new Map();

  seedThreads.forEach((thread) => {
    if (!deleted.has(thread.slug)) bySlug.set(thread.slug, thread);
  });

  storedThreads.forEach((thread) => {
    if (!deleted.has(thread.slug)) bySlug.set(thread.slug, thread);
  });

  return Array.from(bySlug.values());
};

const parseDate = (ddmmyyyy) => {
  const [day, month, year] = ddmmyyyy.split("/").map(Number);
  return new Date(year, month - 1, day);
};

// Fills in fields that some of the older seed/storage records never had —
// the same normalization forumModel.js used to run on every startup.
const normalizeThread = (thread) => ({
  ...thread,
  tags: thread.tags ?? [],
  pinned: thread.pinned ?? false,
  locked: thread.locked ?? false,
  hidden: thread.hidden ?? false,
  posts: thread.posts.map((post, index) => ({
    ...post,
    editedAt: post.editedAt ?? null,
    parentPostId: post.parentPostId ?? null,
    reportedBy: post.reportedBy ?? [],
    createdAt: post.createdAt
      ? new Date(post.createdAt)
      : new Date(parseDate(post.date).getTime() + index),
  })),
});

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "langandco" });
  console.log("[seed] Connected to MongoDB Atlas.");

  await Promise.all([
    Users.deleteMany({}),
    PasswordResetRequests.deleteMany({}),
    ForumThreads.deleteMany({}),
    ForumReports.deleteMany({}),
    ForumNotifications.deleteMany({}),
  ]);
  console.log("[seed] Cleared users, passwordresetrequests, and forum collections.");

  // ---- 1. Users ----
  const userDocs = rawUsers.map(({ id, ...rest }) => ({
    ...rest,
    _id: id,
    role: String(rest.role || "user").toLowerCase(),
  }));

  await Users.insertMany(userDocs);
  console.log(`[seed] Users: ${userDocs.length}`);

  // ---- 2. Password reset requests ----
  const resetDocs = rawPasswordResets.map(({ id, ...rest }) => ({
    ...rest,
    _id: id,
  }));

  if (resetDocs.length) {
    await PasswordResetRequests.insertMany(resetDocs);
  }
  console.log(`[seed] Password reset requests: ${resetDocs.length}`);

  // ---- 3. Forum threads (categories stay a static array in data/forum.js —
  //         they are not a Mongo collection, see DATABASE_Schema notes) ----
  const mergedThreads = mergeThreads(
    forumStorage.deletedThreadSlugs,
    forumStorage.threads
  ).map(normalizeThread);

  const threadDocs = mergedThreads.map((thread) => ({
    ...thread,
    _id: `thread-${thread.slug}`,
  }));

  await ForumThreads.insertMany(threadDocs);
  console.log(`[seed] Forum threads: ${threadDocs.length}`);

  // ---- 4. Forum reports / notifications accumulated at runtime ----
  const reportDocs = forumStorage.reports.map(({ id, ...rest }) => ({
    ...rest,
    _id: id,
  }));

  if (reportDocs.length) {
    await ForumReports.insertMany(reportDocs);
  }
  console.log(`[seed] Forum reports: ${reportDocs.length}`);

  const notificationDocs = forumStorage.notifications.map(({ id, ...rest }) => ({
    ...rest,
    _id: id,
  }));

  if (notificationDocs.length) {
    await ForumNotifications.insertMany(notificationDocs);
  }
  console.log(`[seed] Forum notifications: ${notificationDocs.length}`);

  console.log("[seed] Done.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
