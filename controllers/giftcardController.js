"use strict";

const giftcardModel = require("../models/giftcardModel");
const cartModel = require("../models/cartModel");
const { validateGiftcard } = require("../validators/giftcardValidators");
const { giftcardDefaults, giftCodePattern } = require("../config/giftcardConfig");
const { toFormValues } = require("../utils/giftcardMapper");
const { buildGiftcardPageData } = require("../utils/giftcardViewData");

const getCurrentUser = (req) =>
  req.currentUser || req.session?.user || null;

const isOwner = (giftcard, currentUser) =>
  Boolean(
    giftcard &&
    currentUser &&
    giftcard.createdByUserId &&
    String(giftcard.createdByUserId) === String(currentUser.id),
  );

const loginRedirect = (res) => {
  const redirect = encodeURIComponent("/giftcard#details");
  return res.redirect(`/shared/login?redirect=${redirect}`);
};

const buildViewLocals = (req, values, extras = {}) =>
  buildGiftcardPageData(values, {
    currentUser: getCurrentUser(req),
    ...extras,
  });

const renderGiftcard = (req, res, values, extras = {}, status = 200) =>
  res
    .status(status)
    .render("giftcard/giftcard", buildViewLocals(req, values, extras));

const getGiftcardPage = (req, res, next) => {
  try {
    const currentUser = getCurrentUser(req);
    const cartItemId = String(req.query.cartItem || "").trim();

    if (cartItemId) {
      if (!currentUser) return loginRedirect(res);

      const cartItem = cartModel.getGiftcardDraftItem(
        req.cartUserId,
        cartItemId,
      );

      if (!cartItem) {
        return res.status(404).send("Gift Card cart item not found.");
      }

      req.session.giftcardDraft = { ...cartItem.giftcardDraft };
      req.session.giftcardCartItemId = cartItem.productId;
    } else if (
      req.query.review !== "1" &&
      req.session?.giftcardCartItemId
    ) {
      delete req.session.giftcardCartItemId;
    }

    const draft = req.session?.giftcardDraft || null;
    const reviewMode = Boolean(
      currentUser &&
      draft &&
      req.query.review === "1",
    );

    return renderGiftcard(
      req,
      res,
      draft || giftcardDefaults,
      {
        reviewMode,
        deleted: req.query.deleted === "1",
      },
    );
  } catch (error) {
    return next(error);
  }
};

const reviewGiftcard = (req, res, next) => {
  try {
    const { values, errors, valid } = validateGiftcard(req.body);

    if (!valid) {
      return renderGiftcard(req, res, values, { errors }, 422);
    }

    if (!getCurrentUser(req)) return loginRedirect(res);

    req.session.giftcardDraft = values;
    return res.redirect("/giftcard?review=1#review");
  } catch (error) {
    return next(error);
  }
};

const createGiftcard = (req, res, next) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return loginRedirect(res);
    }

    const draft = req.session?.giftcardDraft;

    if (!draft) {
      return res.redirect("/giftcard#details");
    }

    const {
      values,
      errors,
      valid,
    } = validateGiftcard(draft);

    if (!valid) {
      return renderGiftcard(
        req,
        res,
        values,
        { errors },
        422,
      );
    }

    const savedGiftcard =
      giftcardModel.createGiftcard(
        values,
        currentUser.id,
      );

    const cartValues = {
      ...values,
      code: savedGiftcard.code,
    };

    const result =
      cartModel.addGiftcardDraftToCart(
        req.cartUserId ||
          currentUser.id,
        cartValues,
        req.session?.giftcardCartItemId ||
          null,
      );

    if (!result.success) {
      return res
        .status(400)
        .send(result.message);
    }

    delete req.session.giftcardDraft;
    delete req.session.giftcardCartItemId;

    return res.redirect("/cart");
  } catch (error) {
    return next(error);
  }
};

const viewGiftcard = (req, res, next) => {
  try {
    const giftcard = giftcardModel.getGiftcardByCode(req.params.code);

    if (!giftcard) {
      return res.status(404).send("Gift card not found.");
    }

    const currentUser = getCurrentUser(req);

    return renderGiftcard(
      req,
      res,
      toFormValues(giftcard),
      {
        pageTitle: "Your Impact Gift",
        savedGift: giftcard,
        canManageSavedGift: isOwner(giftcard, currentUser),
      },
    );
  } catch (error) {
    return next(error);
  }
};

const redeemGiftcard = (req, res, next) => {
  try {
    const code = String(req.body.giftCode || "").trim().toUpperCase();
    const values = req.session?.giftcardDraft || giftcardDefaults;

    if (!giftCodePattern.test(code)) {
      return renderGiftcard(
        req,
        res,
        values,
        {
          redeemError: "Enter a gift code in the format LANG-XXXX-XXXX.",
        },
        422,
      );
    }

    const giftcard = giftcardModel.getGiftcardByCode(code);

    if (!giftcard) {
      return renderGiftcard(
        req,
        res,
        values,
        { redeemError: "Gift code not found." },
        404,
      );
    }

    return res.redirect(
      `/shared/profile?tab=orders&giftCode=${encodeURIComponent(
        giftcard.code
      )}`
    );
  } catch (error) {
    return next(error);
  }
};

const getEditGiftcardPage = (req, res, next) => {
  try {
    const currentUser = getCurrentUser(req);
    const giftcard = giftcardModel.getGiftcardById(req.params.id);

    if (!giftcard) {
      return res.status(404).send("Gift card not found.");
    }

    if (!isOwner(giftcard, currentUser)) {
      return res.status(403).send("You cannot edit this gift card.");
    }

    return renderGiftcard(
      req,
      res,
      toFormValues(giftcard),
      {
        pageTitle: "Edit Gift Card",
        editGiftcard: giftcard,
      },
    );
  } catch (error) {
    return next(error);
  }
};

const updateGiftcard = (req, res, next) => {
  try {
    const currentUser = getCurrentUser(req);
    const giftcard = giftcardModel.getGiftcardById(req.params.id);

    if (!giftcard) {
      return res.status(404).send("Gift card not found.");
    }

    if (!isOwner(giftcard, currentUser)) {
      return res.status(403).send("You cannot update this gift card.");
    }

    const { values, errors, valid } = validateGiftcard(req.body);

    if (!valid) {
      return renderGiftcard(
        req,
        res,
        values,
        {
          pageTitle: "Edit Gift Card",
          editGiftcard: giftcard,
          errors,
        },
        422,
      );
    }

    const result = giftcardModel.updateGiftcard(
      req.params.id,
      values,
      currentUser.id,
    );

    if (!result.ok) {
      const status =
        result.reason === "not-found"
          ? 404
          : result.reason === "forbidden"
            ? 403
            : 400;

      const message =
        result.reason === "forbidden"
          ? "You cannot update this gift card."
          : "Unable to update gift card.";

      return res.status(status).send(message);
    }

    return res.redirect(
      `/giftcard/view/${encodeURIComponent(result.giftcard.code)}`,
    );
  } catch (error) {
    return next(error);
  }
};

const deleteGiftcard = (req, res, next) => {
  try {
    const currentUser = getCurrentUser(req);
    const result = giftcardModel.deleteGiftcard(
      req.params.id,
      currentUser?.id,
    );

    if (!result.ok) {
      const status =
        result.reason === "not-found"
          ? 404
          : result.reason === "forbidden"
            ? 403
            : 400;

      const message =
        result.reason === "forbidden"
          ? "You cannot delete this gift card."
          : "Unable to delete gift card.";

      return res.status(status).send(message);
    }

    return res.redirect("/giftcard?deleted=1");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getGiftcardPage,
  reviewGiftcard,
  createGiftcard,
  viewGiftcard,
  redeemGiftcard,
  getEditGiftcardPage,
  updateGiftcard,
  deleteGiftcard,
};