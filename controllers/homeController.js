const landingModel = require("../models/landingModel");
const cartModel = require("../models/cartModel");

const getHomePage = (req, res) => {
  const currentUser = res.locals.currentUser || req.session?.user || null;
  const userId = currentUser?.id ? String(currentUser.id) : "demo-user";
  const cart = cartModel.getCartSummary(userId);

  res.render("home/index", {
    ...landingModel.getLandingPageData(),
    pageTitle: "Home",
    activePage: "home",
    currentUser,
    cartCount: cart.totalQuantity
  });
};

module.exports = { getHomePage };