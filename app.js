"use strict";

const express = require("express");
const path = require("path");
const session = require("express-session");

const routeConfig = require("./config/routeConfig");
const sessionConfig = require("./config/sessionConfig");
const footerConfig = require("./config/footerConfig");

const cartModel = require("./models/cartModel");

const {
  attachCurrentUser,
} = require("./middlewares/authMiddleware");

const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

/* =========================
   EJS
========================= */

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.locals.footer = footerConfig;
app.locals.currentYear = new Date().getFullYear();

/* =========================
   REQUEST PARSING
========================= */

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

/* =========================
   STATIC FILES
========================= */

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);

/* =========================
   SESSION + USER
========================= */

app.use(session(sessionConfig));
app.use(attachCurrentUser);

/* =========================
   GLOBAL EJS VARIABLES
========================= */

app.use((req, res, next) => {
  res.locals.currentUrl = req.originalUrl;
  next();
});

/* =========================
   CART USER + CART COUNT
========================= */

app.use(async (req, res, next) => {
  try {
    const userId = req.currentUser?.id
      ? String(req.currentUser.id)
      : null;

    req.cartUserId = userId;

    if (!userId) {
      res.locals.cartCount = 0;
      return next();
    }

    const cart =
      await cartModel.getCartSummary(userId);

    res.locals.cartCount =
      Number(cart.totalQuantity) || 0;

    return next();
  } catch (error) {
    return next(error);
  }
});

/* =========================
   ROUTES
========================= */

app.use("/", routeConfig);

/* =========================
   ERROR HANDLING
========================= */

app.use(notFound);
app.use(errorHandler);

module.exports = app;