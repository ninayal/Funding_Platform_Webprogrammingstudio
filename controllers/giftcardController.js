"use strict";

const giftcardModel = require(
  "../models/giftcardModel"
);

const getGiftcardPage = (req, res, next) => {
  try {
    const pageData =
      giftcardModel.getGiftcardPageData();

    return res.render("giftcard/giftcard", {
      ...pageData,
      cartCount:
        Number(req.session?.cartCount) ||
        Number(res.locals.cartCount) ||
        4
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getGiftcardPage
};