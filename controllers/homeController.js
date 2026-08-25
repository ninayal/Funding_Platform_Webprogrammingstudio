"use strict";

const landingModel = require("../models/landingModel");
const productModel = require("../models/productModel");
const reviewModel = require("../models/reviewModel");

const getHomePage = async (req, res, next) => {
  try {
    const currentUser =
      res.locals.currentUser ||
      req.session?.user ||
      null;
    const statsMap =
      await reviewModel.getAllReviewStats();
    const featuredProducts =
      await productModel.getFeaturedProducts(
        6,
        statsMap
      );
    return res.render("home/index", {
      ...landingModel.getLandingPageData(),
      featuredProducts,
      pageTitle: "Home",
      activePage: "home",
      currentUser,
      cartCount:
        Number(res.locals.cartCount) || 0,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getHomePage,
};