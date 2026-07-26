const express = require("express");
const homeController = require("../controllers/homeController");

const router = express.Router();

router.get("/", (req, res) => {
  res.render("home/index");
});

module.exports = router;