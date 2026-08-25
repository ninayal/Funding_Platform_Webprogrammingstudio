"use strict";

const cartModel = require("../models/cartModel");

const {
  validateGiftcard,
} = require("../validators/giftcardValidators");

const {
  giftcardDefaults,
} = require("../config/giftcardConfig");

const {
  buildGiftcardPageData,
} = require("../utils/giftcardViewData");

const getCurrentUser = (req) =>
  req.currentUser ||
  req.session?.user ||
  null;

const loginRedirect = (res) => {
  const redirect =
    encodeURIComponent(
      "/giftcard#details"
    );

  return res.redirect(
    `/shared/login?redirect=${redirect}`
  );
};

const renderGiftcard = (
  req,
  res,
  values,
  extras = {},
  status = 200
) =>
  res
    .status(status)
    .render(
      "giftcard/giftcard",
      buildGiftcardPageData(
        values,
        {
          currentUser:
            getCurrentUser(req),
          ...extras,
        }
      )
    );

const getGiftcardPage = async (
  req,
  res,
  next
) => {
  try {
    const currentUser =
      getCurrentUser(req);

    const cartItemId =
      String(
        req.query.cartItem || ""
      ).trim();

    if (cartItemId) {
      if (!currentUser) {
        return loginRedirect(res);
      }

      const cartItem =
        await cartModel.getGiftcardDraftItem(
          req.cartUserId ||
          currentUser.id,
          cartItemId
        );

      if (!cartItem) {
        return res
          .status(404)
          .send(
            "Gift Card cart item not found."
          );
      }

      req.session.giftcardDraft = {
        ...cartItem.giftcardDraft,
      };

      req.session.giftcardCartItemId =
        cartItem.productId;
    } else if (
      req.query.review !== "1" &&
      req.session
        ?.giftcardCartItemId
    ) {
      delete req.session
        .giftcardCartItemId;
    }

    const draft =
      req.session?.giftcardDraft ||
      null;

    const reviewMode =
      Boolean(
        currentUser &&
        draft &&
        req.query.review === "1"
      );

    return renderGiftcard(
      req,
      res,
      draft ||
      giftcardDefaults,
      { reviewMode }
    );
  } catch (error) {
    return next(error);
  }
};

const reviewGiftcard = (
  req,
  res,
  next
) => {
  try {
    const {
      values,
      errors,
      valid,
    } =
      validateGiftcard(
        req.body
      );

    if (!valid) {
      return renderGiftcard(
        req,
        res,
        values,
        { errors },
        422
      );
    }

    if (!getCurrentUser(req)) {
      return loginRedirect(res);
    }

    req.session.giftcardDraft =
      values;

    return res.redirect(
      "/giftcard?review=1#review"
    );
  } catch (error) {
    return next(error);
  }
};

const createGiftcard = async (
  req,
  res,
  next
) => {
  try {
    const currentUser =
      getCurrentUser(req);

    if (!currentUser) {
      return loginRedirect(res);
    }

    const draft =
      req.session?.giftcardDraft;

    if (!draft) {
      return res.redirect(
        "/giftcard#details"
      );
    }

    const {
      values,
      errors,
      valid,
    } =
      validateGiftcard(draft);

    if (!valid) {
      return renderGiftcard(
        req,
        res,
        values,
        { errors },
        422
      );
    }

    const result =
      await cartModel.addGiftcardDraftToCart(
        req.cartUserId ||
        currentUser.id,
        values,
        req.session
          ?.giftcardCartItemId ||
        null
      );

    if (!result.success) {
      return res
        .status(400)
        .send(
          result.message
        );
    }

    delete req.session
      .giftcardDraft;

    delete req.session
      .giftcardCartItemId;

    return res.redirect(
      "/cart"
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getGiftcardPage,
  reviewGiftcard,
  createGiftcard,
};