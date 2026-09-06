"use strict";

const { MongoStore } = require("connect-mongo");

const isProduction =
  process.env.NODE_ENV ===
  "production";

const sessionConfig = {
  name:
    "langco.sid",

  secret:
    process.env.SESSION_SECRET ||
    "lang-and-co-secret-key",

  resave:
    false,

  saveUninitialized:
    false,

  store:
    MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      dbName: "langandco",
      collectionName: "sessions",
    }),

  cookie: {
    httpOnly:
      true,

    sameSite:
      "lax",

    secure:
      isProduction,

    maxAge:
      1000 *
      60 *
      60 *
      24 *
      7
  }
};

module.exports =
  sessionConfig;
