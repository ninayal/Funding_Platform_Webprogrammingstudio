const productModel = require("../models/productModel");

const getProductsPage = (req, res) => {
  const productsPageData = productModel.getProductsPageData();

  res.render("cart/products", productsPageData);
};

const getCartPage = (req, res) => {
  res.render("cart/cart", {
    pageTitle: "Shopping Cart",
  });
};

const getCheckoutPage = (req, res) => {
  res.render("cart/checkout", {
    pageTitle: "Checkout",
  });
};

const getOrderConfirmationPage = (req, res) => {
  res.render("cart/order_confirmation", {
    pageTitle: "Order Confirmation",
  });
};

module.exports = {
  getProductsPage,
  getCartPage,
  getCheckoutPage,
  getOrderConfirmationPage,
};