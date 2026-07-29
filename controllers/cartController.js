const productModel = require("../models/productModel");

const getProductsPage = (req, res, next) => {
  try {
    const productsPageData =
      productModel.getProductsPageData();

    res.render("cart/products", {
      ...productsPageData,
      activePage: "shop",
      cartCount: Array.isArray(req.session.cart)
        ? req.session.cart.reduce(
            (total, item) => total + item.quantity,
            0
          )
        : 0,
    });
  } catch (error) {
    next(error);
  }
};

const getCartPage = (req, res) => {
  res.render("cart/cart", {
    pageTitle: "Shopping Cart",
    activePage: "shop",
    cartCount: Array.isArray(req.session.cart)
      ? req.session.cart.reduce(
          (total, item) => total + item.quantity,
          0
        )
      : 0,
  });
};

const getCheckoutPage = (req, res) => {
  res.render("cart/checkout", {
    pageTitle: "Checkout",
    activePage: "shop",
    cartCount: Array.isArray(req.session.cart)
      ? req.session.cart.reduce(
          (total, item) => total + item.quantity,
          0
        )
      : 0,
  });
};

const getOrderConfirmationPage = (req, res) => {
  res.render("cart/order_confirmation", {
    pageTitle: "Order Confirmation",
    activePage: "shop",
    cartCount: Array.isArray(req.session.cart)
      ? req.session.cart.reduce(
          (total, item) => total + item.quantity,
          0
        )
      : 0,
  });
};

module.exports = {
  getProductsPage,
  getCartPage,
  getCheckoutPage,
  getOrderConfirmationPage,
};