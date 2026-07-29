"use strict";

const express = require("express");
const path = require("path");
const session = require("express-session");

const routeConfig = require("./config/routeConfig");
const sessionConfig = require("./config/sessionConfig");
const footerConfig = require("./config/footerConfig");

const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const {
  attachCurrentUser,
} = require("./middlewares/authMiddleware");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.locals.footer = footerConfig;
app.locals.currentYear = new Date().getFullYear();

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(express.json());

app.use(session(sessionConfig));

/*
 * Makes the currently logged-in user available to:
 *
 * req.currentUser
 * res.locals.currentUser
 * res.locals.currentUserId
 *
 * This can be reused by Blog, Forum, Review, Cart,
 * Gift Card, and other modules.
 */
app.use(attachCurrentUser);

app.use(
  express.static(
    path.join(__dirname, "public"),
  ),
);

app.use("/", routeConfig);

app.use(notFound);
app.use(errorHandler);

module.exports = app;