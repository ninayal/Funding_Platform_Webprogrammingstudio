const productModel = require("../models/productModel");
const cartModel = require("../models/cartModel");
const getCurrentUser = (req, res) => res.locals.currentUser || req.session?.user || null;
const getCurrentUserId = (req) => {
  if (req.session?.user?.id) return String(req.session.user.id);
  return "demo-user";
};
const prepareCartView = (cart) => {
  const items = cart.items.map((item) => ({
    productId: item.product.id,
    name: item.product.name,
    image: item.product.image,
    price: item.product.price,
    priceFormatted: `£${item.product.price.toFixed(2)}`,
    quantity: item.quantity,
    stock: item.product.stock,
    subtotal: item.subtotal,
    subtotalFormatted: `£${item.subtotal.toFixed(2)}`,
    searchTitle: item.product.name.toLowerCase()
  }));
  const EXPRESS_SHIPPING_FEE = 12;
  return {
    items,
    hasItems: items.length > 0,
    totalQuantity: cart.totalQuantity,
    subtotal: cart.subtotal,
    subtotalFormatted: `£${cart.subtotal.toFixed(2)}`,
    expressTotal: cart.subtotal + EXPRESS_SHIPPING_FEE
  };
};
const getProductsPage = (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const productsPageData = productModel.getProductsPageData();
    const cart = cartModel.getCartSummary(userId);
    res.render("cart/products", {
      ...productsPageData,
      activePage: "shop",
      currentUser: getCurrentUser(req, res),
      cartCount: cart.totalQuantity
    });
  } catch (error) {
    next(error);
  }
};
const getCartPage = (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const cart = prepareCartView(cartModel.getCartSummary(userId));
    res.render("cart/cart", {
      pageTitle: "Shopping Cart",
      activePage: "shop",
      currentUser: getCurrentUser(req, res),
      cartCount: cart.totalQuantity,
      cart
    });
  } catch (error) {
    next(error);
  }
};
const getCheckoutPage = (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const cart = prepareCartView(cartModel.getCartSummary(userId));
    if (!cart.hasItems) return res.redirect("/cart");
    res.render("cart/checkout", {
      pageTitle: "Checkout",
      activePage: "shop",
      currentUser: getCurrentUser(req, res),
      cartCount: cart.totalQuantity,
      cart,
      errors: {},
      formData: {}
    });
  } catch (error) {
    next(error);
  }
};
const getOrderConfirmationPage = (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const cart = prepareCartView(cartModel.getCartSummary(userId));
    res.render("cart/order_confirmation", {
      pageTitle: "Order Confirmation",
      activePage: "shop",
      currentUser: getCurrentUser(req, res),
      cartCount: cart.totalQuantity
    });
  } catch (error) {
    next(error);
  }
};
const addToCart = (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const { productId, quantity = 1 } = req.body;
    const result = cartModel.addItemToCart(userId, productId, quantity);
    if (!result.success) return res.status(400).send(result.message);
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
    if (!result.success) return res.status(400).send(result.message);
    return res.redirect("/cart");
  } catch (error) {
    next(error);
  }
};
const removeCartItem = (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const { productId } = req.body;
    const result = cartModel.removeCartItem(userId, productId);
    if (result && !result.success) return res.status(400).send(result.message);
    return res.redirect("/cart");
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