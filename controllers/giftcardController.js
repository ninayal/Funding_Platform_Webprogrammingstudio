"use strict";

const giftcardModel = require("../models/giftcardModel");
const {
  validateGiftcard,
} = require("../validators/giftcardValidators");

const getCurrentUser = (req) =>
  req.currentUser || req.session?.user || null;

const getGiftcardPage = (req, res, next) => {
  try {
    const pageData = giftcardModel.getGiftcardPageData();

    res.render("giftcard/giftcard", {
      ...pageData,
      errors: {},
      createdGift: null,
      redeemedGift: null,
      redeemError: "",
    });
  } catch (error) {
    next(error);
  }
};

const reviewGiftcard = (req, res, next) => {
  try {
    const {
      values,
      errors,
      valid,
    } = validateGiftcard(req.body);

    const pageData =
      giftcardModel.getGiftcardPageData(values);

    if (!valid) {
      return res.status(422).render(
        "giftcard/giftcard",
        {
          ...pageData,
          errors,
          createdGift: null,
          redeemedGift: null,
          redeemError: "",
        },
      );
    }

    req.session.giftcardDraft = values;

    return res.redirect(
      "/giftcard?review=1#review",
    );
  } catch (error) {
    next(error);
  }
};

const createGiftcard = (req, res, next) => {
  try {
    const currentUser = getCurrentUser(req);
    const draft = req.session?.giftcardDraft;

    if (!draft) {
      return res.redirect("/giftcard");
    }

    const {
      values,
      valid,
    } = validateGiftcard(draft);

    if (!valid) {
      return res.redirect("/giftcard");
    }

    const giftcard =
      giftcardModel.createGiftcard(
        values,
        currentUser?.id || null,
      );

    delete req.session.giftcardDraft;

    return res.redirect(
      `/giftcard/view/${encodeURIComponent(
        giftcard.code,
      )}`,
    );
  } catch (error) {
    next(error);
  }
};

const viewGiftcard = (req, res, next) => {
  try {
    const giftcard =
      giftcardModel.getGiftcardByCode(
        req.params.code,
      );

    if (!giftcard) {
      return res
        .status(404)
        .send("Gift card not found.");
    }

    return res.render(
      "giftcard/gift-view",
      {
        pageTitle: "Your Impact Gift",
        activePage: "giftcard",

        giftcard: {
          ...giftcard,

          amountDisplay:
            giftcardModel.formatUsd(
              giftcard.amountPerCard,
            ),

          totalDisplay:
            giftcardModel.formatUsd(
              giftcard.totalAmount,
            ),
        },
      },
    );
  } catch (error) {
    next(error);
  }
};

const redeemGiftcard = (req, res, next) => {
  try {
    const code = String(
      req.body.giftCode || "",
    )
      .trim()
      .toUpperCase();

    const giftcard =
      giftcardModel.getGiftcardByCode(code);

    if (!giftcard) {
      const pageData =
        giftcardModel.getGiftcardPageData();

      return res.status(404).render(
        "giftcard/giftcard",
        {
          ...pageData,
          errors: {},
          createdGift: null,
          redeemedGift: null,
          redeemError:
            "Gift code not found.",
        },
      );
    }

    return res.redirect(
      `/giftcard/view/${encodeURIComponent(
        giftcard.code,
      )}`,
    );
  } catch (error) {
    next(error);
  }
};

const getEditGiftcardPage = (
  req,
  res,
  next,
) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res
        .status(401)
        .send(
          "You must be signed in to edit this gift card.",
        );
    }

    const giftcard =
      giftcardModel.getGiftcardById(
        req.params.id,
      );

    if (!giftcard) {
      return res
        .status(404)
        .send("Gift card not found.");
    }

    if (
      giftcard.createdByUserId &&
      String(giftcard.createdByUserId) !==
        String(currentUser.id)
    ) {
      return res
        .status(403)
        .send(
          "You cannot edit this gift card.",
        );
    }

    const values = {
      giftType: giftcard.giftType,
      deliveryType: giftcard.deliveryType,
      designType: giftcard.designType,
      quantity: giftcard.quantity,
      amountPerCard:
        giftcard.amountPerCard,

      recipientName:
        giftcard.recipientName,

      senderName:
        giftcard.senderName,

      message:
        giftcard.message,

      causeCategory:
        giftcard.causeCategory || "",

      causeNote:
        giftcard.causeNote || "",

      recipientEmail:
        giftcard.digital
          ?.recipientEmail || "",

      emailTiming:
        giftcard.digital
          ?.emailTiming ||
        "Send immediately",

      emailDeliveryDate:
        giftcard.digital
          ?.emailDeliveryDate || "",

      printFormat:
        giftcard.printable
          ?.printFormat ||
        "Flat Card",

      paperSize:
        giftcard.printable
          ?.paperSize || "A4",

      downloadFormat:
        giftcard.printable
          ?.downloadFormat ||
        "PDF — Print Ready",

      recipientPhone:
        giftcard.physical
          ?.recipientPhone || "",

      physicalDeliveryDate:
        giftcard.physical
          ?.physicalDeliveryDate || "",

      streetAddress:
        giftcard.physical
          ?.streetAddress || "",

      district:
        giftcard.physical
          ?.district || "",

      city:
        giftcard.physical
          ?.city || "",

      postalCode:
        giftcard.physical
          ?.postalCode || "",
    };

    const pageData =
      giftcardModel.getGiftcardPageData(
        values,
      );

    return res.render(
      "giftcard/gift-edit",
      {
        ...pageData,
        giftcard,
        values,
        errors: {},
      },
    );
  } catch (error) {
    next(error);
  }
};

const updateGiftcard = (req, res, next) => {
  try {
    const currentUser = getCurrentUser(req);

    if (!currentUser) {
      return res
        .status(401)
        .send(
          "You must be signed in to update this gift card.",
        );
    }

    const giftcard =
      giftcardModel.getGiftcardById(
        req.params.id,
      );

    if (!giftcard) {
      return res
        .status(404)
        .send("Gift card not found.");
    }

    if (
      giftcard.createdByUserId &&
      String(giftcard.createdByUserId) !==
      String(currentUser.id)
    ) {
      return res
        .status(403)
        .send(
          "You cannot update this gift card.",
        );
    }

    const {
      values,
      errors,
      valid,
    } = validateGiftcard(req.body);

    if (!valid) {
      return res.status(422).render(
        "giftcard/gift-edit",
        {
          pageTitle: "Edit Gift Card",
          activePage: "giftcard",
          giftcard,
          values,
          errors,
        },
      );
    }

    const result =
      giftcardModel.updateGiftcard(
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

      return res
        .status(status)
        .send(
          result.reason === "forbidden"
            ? "You cannot update this gift card."
            : "Unable to update gift card.",
        );
    }

    return res.redirect(
      `/giftcard/view/${encodeURIComponent(
        result.giftcard.code,
      )}`,
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGiftcardPage,
  getEditGiftcardPage,
  reviewGiftcard,
  createGiftcard,
  viewGiftcard,
  redeemGiftcard,
  updateGiftcard,
};