"use strict";

const giftcardModel =
  require(
    "../models/giftcardModel",
  );

const {
  deleteGiftcard:
    deleteGiftcardFromStore,
} = require(
  "../models/giftcardDeleteModel",
);

const {
  validateGiftcard,
} = require(
  "../validators/giftcardValidators",
);

const GIFT_CODE_PATTERN =
  /^LANG-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

const blankCreateValues = {
  giftType: "",
  deliveryType: "",
  designType: "",
  quantity: "",
  amountPerCard: "",
  recipientName: "",
  senderName: "",
  message: "",
  causeCategory: "",
  causeNote: "",
  recipientEmail: "",
  emailTiming:
    "Send immediately",
  emailDeliveryDate: "",
  printFormat:
    "Flat Card",
  paperSize: "A4",
  downloadFormat:
    "PDF — Print Ready",
  recipientPhone: "",
  physicalDeliveryDate: "",
  streetAddress: "",
  district: "",
  city: "",
  postalCode: "",
};

const getCurrentUser = (
  req,
) =>
  req.currentUser ||
  req.session?.user ||
  null;

const isOwner = (
  giftcard,
  currentUser,
) =>
  Boolean(
    giftcard &&
    currentUser &&
    giftcard.createdByUserId &&
    String(
      giftcard
        .createdByUserId,
    ) ===
      String(
        currentUser.id,
      ),
  );

const toFormValues = (
  giftcard,
) => ({
  giftType:
    giftcard.giftType,

  deliveryType:
    giftcard.deliveryType,

  designType:
    giftcard.designType,

  quantity:
    giftcard.quantity,

  amountPerCard:
    giftcard.amountPerCard,

  recipientName:
    giftcard.recipientName,

  senderName:
    giftcard.senderName,

  message:
    giftcard.message,

  causeCategory:
    giftcard.causeCategory ||
    "",

  causeNote:
    giftcard.causeNote ||
    "",

  recipientEmail:
    giftcard.digital
      ?.recipientEmail ||
    "",

  emailTiming:
    giftcard.digital
      ?.emailTiming ||
    "Send immediately",

  emailDeliveryDate:
    giftcard.digital
      ?.emailDeliveryDate ||
    "",

  printFormat:
    giftcard.printable
      ?.printFormat ||
    "Flat Card",

  paperSize:
    giftcard.printable
      ?.paperSize ||
    "A4",

  downloadFormat:
    giftcard.printable
      ?.downloadFormat ||
    "PDF — Print Ready",

  recipientPhone:
    giftcard.physical
      ?.recipientPhone ||
    "",

  physicalDeliveryDate:
    giftcard.physical
      ?.physicalDeliveryDate ||
    "",

  streetAddress:
    giftcard.physical
      ?.streetAddress ||
    "",

  district:
    giftcard.physical
      ?.district ||
    "",

  city:
    giftcard.physical
      ?.city ||
    "",

  postalCode:
    giftcard.physical
      ?.postalCode ||
    "",
});

const buildViewLocals = (
  values,
  extras = {},
) => ({
  ...giftcardModel
    .getGiftcardPageData(
      values,
    ),

  errors: {},
  reviewMode: false,
  editGiftcard: null,
  savedGift: null,
  redeemError: "",
  deleted: false,

  ...extras,
});

const renderGiftcard = (
  res,
  values,
  extras = {},
  status = 200,
) =>
  res
    .status(status)
    .render(
      "giftcard/giftcard",
      buildViewLocals(
        values,
        extras,
      ),
    );

const getGiftcardPage = (
  req,
  res,
  next,
) => {
  try {
    const currentUser =
      getCurrentUser(req);

    const draft =
      req.session
        ?.giftcardDraft ||
      null;

    const reviewMode =
      Boolean(
        currentUser &&
        draft &&
        req.query.review ===
          "1",
      );

    const values =
      draft ||
      blankCreateValues;

    return renderGiftcard(
      res,
      values,
      {
        reviewMode,
        deleted:
          req.query.deleted ===
          "1",
      },
    );
  } catch (error) {
    return next(error);
  }
};

const reviewGiftcard = (
  req,
  res,
  next,
) => {
  try {
    const {
      values,
      errors,
      valid,
    } =
      validateGiftcard(
        req.body,
      );

    if (!valid) {
      return renderGiftcard(
        res,
        values,
        {
          errors,
        },
        422,
      );
    }

    const currentUser =
      getCurrentUser(req);

    /*
     * Login regenerates the session in this project.
     * Therefore we do not rely on a guest session draft.
     * Client Web Storage keeps the completed form while
     * the user signs in, then they Review once more.
     */
    if (!currentUser) {
      const redirect =
        encodeURIComponent(
          "/giftcard#details",
        );

      return res.redirect(
        `/shared/login?redirect=${redirect}`,
      );
    }

    req.session
      .giftcardDraft =
      values;

    return res.redirect(
      "/giftcard?review=1#review",
    );
  } catch (error) {
    return next(error);
  }
};

const createGiftcard = (
  req,
  res,
  next,
) => {
  try {
    const currentUser =
      getCurrentUser(req);

    if (!currentUser) {
      const redirect =
        encodeURIComponent(
          "/giftcard#details",
        );

      return res.redirect(
        `/shared/login?redirect=${redirect}`,
      );
    }

    const draft =
      req.session
        ?.giftcardDraft;

    if (!draft) {
      return res.redirect(
        "/giftcard#details",
      );
    }

    const {
      values,
      errors,
      valid,
    } =
      validateGiftcard(
        draft,
      );

    if (!valid) {
      return renderGiftcard(
        res,
        values,
        {
          errors,
        },
        422,
      );
    }

    const giftcard =
      giftcardModel
        .createGiftcard(
          values,
          currentUser.id,
        );

    delete req.session
      .giftcardDraft;

    return res.redirect(
      `/giftcard/view/${encodeURIComponent(
        giftcard.code,
      )}`,
    );
  } catch (error) {
    return next(error);
  }
};

const formatSavedGift = (
  giftcard,
) => {
  const values =
    toFormValues(
      giftcard,
    );

  const pageData =
    giftcardModel
      .getGiftcardPageData(
        values,
      );

  return {
    ...giftcard,

    giftTypeLabel:
      pageData
        .selectedGiftType
        .title,

    deliveryLabel:
      pageData
        .selectedDelivery
        .title,

    designLabel:
      pageData
        .selectedDesign
        .title,

    amountDisplay:
      giftcardModel
        .formatUsd(
          giftcard
            .amountPerCard,
        ),

    totalDisplay:
      giftcardModel
        .formatUsd(
          giftcard
            .totalAmount,
        ),
  };
};

const viewGiftcard = (
  req,
  res,
  next,
) => {
  try {
    const giftcard =
      giftcardModel
        .getGiftcardByCode(
          req.params.code,
        );

    if (!giftcard) {
      return res
        .status(404)
        .send(
          "Gift card not found.",
        );
    }

    const values =
      toFormValues(
        giftcard,
      );

    return renderGiftcard(
      res,
      values,
      {
        pageTitle:
          "Your Impact Gift",

        savedGift:
          formatSavedGift(
            giftcard,
          ),
      },
    );
  } catch (error) {
    return next(error);
  }
};

const redeemGiftcard = (
  req,
  res,
  next,
) => {
  try {
    const code =
      String(
        req.body
          .giftCode ||
        "",
      )
        .trim()
        .toUpperCase();

    const values =
      req.session
        ?.giftcardDraft ||
      blankCreateValues;

    if (
      !GIFT_CODE_PATTERN
        .test(code)
    ) {
      return renderGiftcard(
        res,
        values,
        {
          redeemError:
            "Enter a gift code in the format LANG-XXXX-XXXX.",
        },
        422,
      );
    }

    const giftcard =
      giftcardModel
        .getGiftcardByCode(
          code,
        );

    if (!giftcard) {
      return renderGiftcard(
        res,
        values,
        {
          redeemError:
            "Gift code not found.",
        },
        404,
      );
    }

    return res.redirect(
      `/giftcard/view/${encodeURIComponent(
        giftcard.code,
      )}`,
    );
  } catch (error) {
    return next(error);
  }
};

const getEditGiftcardPage = (
  req,
  res,
  next,
) => {
  try {
    const currentUser =
      getCurrentUser(req);

    const giftcard =
      giftcardModel
        .getGiftcardById(
          req.params.id,
        );

    if (!giftcard) {
      return res
        .status(404)
        .send(
          "Gift card not found.",
        );
    }

    if (
      !isOwner(
        giftcard,
        currentUser,
      )
    ) {
      return res
        .status(403)
        .send(
          "You cannot edit this gift card.",
        );
    }

    return renderGiftcard(
      res,
      toFormValues(
        giftcard,
      ),
      {
        pageTitle:
          "Edit Gift Card",

        editGiftcard:
          giftcard,
      },
    );
  } catch (error) {
    return next(error);
  }
};

const updateGiftcard = (
  req,
  res,
  next,
) => {
  try {
    const currentUser =
      getCurrentUser(req);

    const giftcard =
      giftcardModel
        .getGiftcardById(
          req.params.id,
        );

    if (!giftcard) {
      return res
        .status(404)
        .send(
          "Gift card not found.",
        );
    }

    if (
      !isOwner(
        giftcard,
        currentUser,
      )
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
    } =
      validateGiftcard(
        req.body,
      );

    if (!valid) {
      return renderGiftcard(
        res,
        values,
        {
          pageTitle:
            "Edit Gift Card",

          editGiftcard:
            giftcard,

          errors,
        },
        422,
      );
    }

    const result =
      giftcardModel
        .updateGiftcard(
          req.params.id,
          values,
          currentUser.id,
        );

    if (!result.ok) {
      const status =
        result.reason ===
          "not-found"
          ? 404
          : result.reason ===
              "forbidden"
            ? 403
            : 400;

      return res
        .status(status)
        .send(
          result.reason ===
            "forbidden"
            ? "You cannot update this gift card."
            : "Unable to update gift card.",
        );
    }

    return res.redirect(
      `/giftcard/view/${encodeURIComponent(
        result
          .giftcard
          .code,
      )}`,
    );
  } catch (error) {
    return next(error);
  }
};

const deleteGiftcard = (
  req,
  res,
  next,
) => {
  try {
    const currentUser =
      getCurrentUser(req);

    const result =
      deleteGiftcardFromStore(
        req.params.id,
        currentUser?.id,
      );

    if (!result.ok) {
      const status =
        result.reason ===
          "not-found"
          ? 404
          : result.reason ===
              "forbidden"
            ? 403
            : 400;

      return res
        .status(status)
        .send(
          result.reason ===
            "forbidden"
            ? "You cannot delete this gift card."
            : "Unable to delete gift card.",
        );
    }

    return res.redirect(
      "/giftcard?deleted=1",
    );
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
