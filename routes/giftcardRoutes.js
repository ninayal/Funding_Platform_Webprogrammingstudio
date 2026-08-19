"use strict";

const express =
  require("express");

const giftcardController =
  require(
    "../controllers/giftcardController",
  );

const {
  requireAuth,
} = require(
  "../middlewares/authMiddleware",
);

const router =
  express.Router();

/* Main page: /giftcard */
router.get(
  "/",
  giftcardController
    .getGiftcardPage,
);

/*
 * Compatibility for the old header URL:
 * /giftcard/giftcard -> /giftcard
 */
router.get(
  "/giftcard",
  (req, res) =>
    res.redirect(
      301,
      "/giftcard",
    ),
);

/* Validate the creation form and open Review. */
router.post(
  "/review",
  giftcardController
    .reviewGiftcard,
);

/* Create the validated draft. */
router.post(
  "/create",
  giftcardController
    .createGiftcard,
);

/* Look up an existing gift code. */
router.post(
  "/redeem",
  giftcardController
    .redeemGiftcard,
);

/* Edit existing data owned by the logged-in user. */
router.get(
  "/:id/edit",
  requireAuth,
  giftcardController
    .getEditGiftcardPage,
);

router.post(
  "/:id/update",
  requireAuth,
  giftcardController
    .updateGiftcard,
);

router.post(
  "/:id/delete",
  requireAuth,
  giftcardController
    .deleteGiftcard,
);

/* Retrieve a saved gift. */
router.get(
  "/view/:code",
  giftcardController
    .viewGiftcard,
);

module.exports =
  router;
