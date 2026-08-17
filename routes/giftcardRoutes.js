"use strict";

const express = require("express");
const giftcardController =
  require("../controllers/giftcardController");

const router = express.Router();

/* Main page */
router.get(
  "/",
  giftcardController.getGiftcardPage,
);

/* Review */
router.post(
  "/review",
  giftcardController.reviewGiftcard,
);

/* Create */
router.post(
  "/create",
  giftcardController.createGiftcard,
);

/* Redeem */
router.post(
  "/redeem",
  giftcardController.redeemGiftcard,
);

/* Edit page */
router.get(
  "/:id/edit",
  giftcardController.getEditGiftcardPage,
);

/* Update */
router.post(
  "/:id/update",
  giftcardController.updateGiftcard,
);

/* View saved gift */
router.get(
  "/view/:code",
  giftcardController.viewGiftcard,
);

module.exports = router;