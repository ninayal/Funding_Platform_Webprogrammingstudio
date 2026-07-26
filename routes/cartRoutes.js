const express = require("express");
const cartController = require("../controllers/cartController");

const router = express.Router();

router.get("/products", (req, res) => {
  res.render("cart/products");
});

router.get("/cart", (req, res) => {
  res.render("cart/cart");
});

router.get("/checkout", (req, res) => {
  res.render("cart/checkout");
});

router.get("/order-confirmation", (req, res) => {
  res.render("cart/order_confirmation");
});

module.exports = router;