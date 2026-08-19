"use strict";

const express = require("express");

const authController = require("../controllers/authController");
const profileController = require("../controllers/profileController");
const sharedController = require("../controllers/sharedController");

const { requireAuth } = require("../middlewares/authMiddleware");
const requireAdmin = require("../middlewares/requireAdmin");
const uploadProductImages =
  require("../middlewares/uploadProductImages");

const router = express.Router();

/* Auth */
router.get("/login", authController.getLoginPage);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

router.get("/register", authController.getRegisterPage);
router.post("/register", authController.register);

/* Password */
router.get(
  "/forgot-password",
  sharedController.getForgotPasswordPage,
);

router.post(
  "/forgot-password",
  sharedController.postForgotPassword,
);

router.get(
  "/reset-password",
  sharedController.getResetPasswordPage,
);

router.post(
  "/reset-password",
  sharedController.postResetPassword,
);

/* Profile */
router.get(
  "/profile",
  requireAuth,
  profileController.getProfilePage,
);

router.post(
  "/profile",
  requireAuth,
  profileController.updateProfile,
);

router.post(
  "/profile/preferences",
  requireAuth,
  profileController.updatePreferences,
);

/* Admin */
router.get(
  "/admin",
  requireAdmin,
  sharedController.getAdminPage,
);

router.post(
  "/admin/password-resets/:requestId/resolve",
  requireAdmin,
  sharedController.postResolvePasswordReset,
);

router.post(
  "/admin/password-resets/:requestId/reject",
  requireAdmin,
  sharedController.postRejectPasswordReset,
);

router.get(
  "/admin/products/new",
  requireAdmin,
  sharedController.getProductFormPage,
);

router.get(
  "/admin/products/:id/edit",
  requireAdmin,
  sharedController.getProductFormPage,
);

router.post(
  "/admin/products",
  requireAdmin,
  uploadProductImages,
  sharedController.postCreateProduct,
);

router.post(
  "/admin/products/:id",
  requireAdmin,
  uploadProductImages,
  sharedController.postUpdateProduct,
);

router.post(
  "/admin/products/:id/toggle",
  requireAdmin,
  sharedController.postToggleProductStatus,
);

router.post(
  "/admin/products/:id/delete",
  requireAdmin,
  sharedController.postDeleteProduct,
);

/* Sitemap */
router.get(
  "/sitemap",
  sharedController.getSitemapPage,
);

module.exports = router;