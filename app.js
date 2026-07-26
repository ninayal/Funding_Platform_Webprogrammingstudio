const express = require("express");
const path = require("path");
const session = require("express-session");

// Routes
const homeRoutes = require("./routes/homeRoutes");
const sharedRoutes = require("./routes/sharedRoutes");
const cartRoutes = require("./routes/cartRoutes");
const blogRoutes = require("./routes/blogRoutes");
const forumRoutes = require("./routes/forumRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const giftcardRoutes = require("./routes/giftcardRoutes");

//middleware
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const PORT = 3000;

//Config
const sessionConfig = require("./config/sessionConfig");

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Config
app.use(session(sessionConfig));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Home Route
app.use("/", homeRoutes);

//Shared Route
app.use("/shared", sharedRoutes);

// Cart Route
app.use("/cart", cartRoutes);

// Blog Route
app.use("/blog", blogRoutes);

//Forum Route
app.use("/forum", forumRoutes);

//Review Route
app.use("/review", reviewRoutes);

//Giftcard Routes
app.use("/giftcard", giftcardRoutes);

// Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;