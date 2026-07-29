"use strict";

const isProduction =
  process.env.NODE_ENV === "production";

const sessionConfig = {
  name: "langco.sid",

  secret:
    process.env.SESSION_SECRET ||
    "lang-and-co-development-secret-change-me",

  resave: false,
  saveUninitialized: false,

  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,

    /*
     * Keep the user logged in for seven days.
     */
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

module.exports = sessionConfig;