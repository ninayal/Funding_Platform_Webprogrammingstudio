const express = require("express");

const router = express.Router();

router.get("/giftcard", (req, res) => {
  res.render("giftcard/giftcard");
});

module.exports = router;