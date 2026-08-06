"use strict";

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
