"use strict";

const express = require("express");
const giftcardController = require(
  "../controllers/giftcardController"
);

const router = express.Router();

// URL chính: GET /giftcard
router.get(
  "/",
  giftcardController.getGiftcardPage
);

// URL cũ: GET /giftcard/giftcard
router.get("/giftcard", (req, res) => {
  return res.redirect("/giftcard");
});

module.exports = router;