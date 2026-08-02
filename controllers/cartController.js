const productModel = require("../models/productModel");
const cartModel = require("../models/cartModel");

const getCurrentUserId = (req) => {
  if (req.session?.user?.id) {
    return String(req.session.user.id);
  }
  return "demo-user";
};

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

const getCartPage = (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const cart = cartModel.getCartSummary(userId);
    res.render("cart/cart", {
      pageTitle: "Shopping Cart",
      activePage: "shop",
      cart,
    });
  } catch (error) {
    next(error);
  }
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

const addToCart = (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const { productId, quantity = 1 } = req.body;
    const result = cartModel.addItemToCart(
      userId,
      productId,
      quantity
    );
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.redirect("/cart");
  } catch (error) {
    next(error);
  }
};

const updateCartItem = (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const { productId, quantity } = req.body;
    const result = cartModel.updateCartItem(userId, productId, quantity);

    if (!result.success) {
      return res.status(400).json(result);
    }
    res.redirect("/cart");
  } catch (error) {
    next(error);
  }
};

const removeCartItem = (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const { productId } = req.body;
    cartModel.removeCartItem(userId, productId);
    res.redirect("/cart");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductsPage,
  getCartPage,
  getCheckoutPage,
  getOrderConfirmationPage,
  addToCart,
  updateCartItem,
  removeCartItem 
};