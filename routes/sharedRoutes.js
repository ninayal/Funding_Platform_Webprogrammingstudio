"use strict";

const express = require(
  "express"
);

const authController = require(
  "../controllers/authController"
);

const {
  requireAuth,
  safeRedirectPath
} = require(
  "../middlewares/authMiddleware"
);

const router =
  express.Router();

router.get(
  "/login",
  authController.getLoginPage
);

router.post(
  "/login",
  authController.login
);

router.get(
  "/register",
  authController.getRegisterPage
);

router.post(
  "/register",
  authController.register
);

router.post(
  "/logout",
  requireAuth,
  authController.logout
);

router.get(
  "/forgot-password",
  (req, res) => {
    const redirect =
      safeRedirectPath(
        req.query.redirect,
        "/"
      );

    return res.render(
      "shared/forgot_password",
      {
        redirect
      }
    );
  }
);

router.get(
  "/profile",
  requireAuth,
  (req, res) => {
    return res.render(
      "shared/profile"
    );
  }
);

router.get(
  "/admin",
  requireAuth,
  (req, res) => {
    return res.render(
      "shared/admin/admin"
    );
  }
);

router.get(
  "/sitemap",
  (req, res) => {
    return res.render(
      "shared/sitemap"
    );
  }
);

module.exports = router;
