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


const app = express();
const PORT = 3000;

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "lang-and-co-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

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



// 404 page
app.use((req, res) => {
  res.status(404).send("404 - Page not found");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});