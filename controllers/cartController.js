const getProductsPage = (req, res) => {
  res.render("cart/products");
};

const getCartPage = (req, res) => {
  res.render("cart/cart");
};

const getCheckoutPage = (req, res) => {
  res.render("cart/checkout");
};

const getOrderConfirmationPage = (req, res) => {
  res.render("cart/order_confirmation");
};

module.exports = {
  getProductsPage,
  getCartPage,
  getCheckoutPage,
  getOrderConfirmationPage,
};