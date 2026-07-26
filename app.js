const express = require("express");
const path = require("path");
const session = require("express-session");

// Routes
const routes = require("./routes");

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

app.use("/", routes);

// Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;