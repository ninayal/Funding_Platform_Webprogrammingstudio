const express = require("express");

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("shared/login");
});

router.get("/register", (req, res) => {
  res.render("shared/register");
});

router.get("/forgot-password", (req, res) => {
  res.render("shared/forgot_password");
});

router.get("/profile", (req, res) => {
  res.render("shared/profile");
});

router.get("/admin", (req, res) => {
  res.render("shared/admin/admin");
});

router.get("/sitemap", (req, res) => {
  res.render("shared/sitemap");
});

module.exports = router;