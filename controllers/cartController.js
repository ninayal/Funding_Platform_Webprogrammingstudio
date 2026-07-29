const productModel = require("../models/productModel");

const getProductsPage = (req, res) => {
  const productsPageData = productModel.getProductsPageData();

  res.render("cart/products", {
    ...productsPageData,
    activePage: "shop",
    cartCount: 4,
  });
};

const getCartPage = (req, res) => {
  res.render("cart/cart", {
    pageTitle: "Shopping Cart",
    activePage: "shop",
    cartCount: 4,
  });
};

const getCheckoutPage = (req, res) => {
  res.render("cart/checkout", {
    pageTitle: "Checkout",
    activePage: "shop",
    cartCount: 4,
  });
};

const getOrderConfirmationPage = (req, res) => {
  res.render("cart/order_confirmation", {
    pageTitle: "Order Confirmation",
    activePage: "shop",
    cartCount: 4,
  });
};

module.exports = {
  getProductsPage,
  getCartPage,
  getCheckoutPage,
  getOrderConfirmationPage,
};