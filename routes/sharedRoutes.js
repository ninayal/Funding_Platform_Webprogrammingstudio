"use strict";

const express = require(
  "express",
);

const authController =
  require(
    "../controllers/authController",
  );

const {
  requireAuth,
} = require(
  "../middlewares/authMiddleware",
);

const router =
  express.Router();

router.get(
  "/login",
  authController.getLoginPage,
);

router.post(
  "/login",
  authController.login,
);

router.get(
  "/register",
  authController.getRegisterPage,
);

router.post(
  "/register",
  authController.register,
);

router.post(
  "/logout",
  requireAuth,
  authController.logout,
);

router.get(
  "/forgot-password",
  (req, res) => {
    res.render(
      "shared/forgot_password",
    );
  },
);

router.get(
  "/profile",
  requireAuth,
  (req, res) => {
    res.render(
      "shared/profile",
    );
  },
);

router.get(
  "/admin",
  requireAuth,
  (req, res) => {
    res.render(
      "shared/admin/admin",
    );
  },
);

router.get(
  "/sitemap",
  (req, res) => {
    res.render(
      "shared/sitemap",
    );
  },
);

module.exports = router;