"use strict";

const express = require(
  "express"
);

const authController = require(
  "../controllers/authController"
);

const profileController = require(
  "../controllers/profileController"
);

const {
  requireAuth,
  safeRedirectPath
} = require(
  "../middlewares/authMiddleware"
);
const uploadProductImages = require("../middlewares/uploadProductImages");
const requireAdmin = require("../middlewares/requireAdmin");

const router =
  express.Router();

router.get("/login", sharedController.getLoginPage);
router.post("/login", sharedController.postLogin);
router.post("/logout", sharedController.postLogout);

router.get("/register", sharedController.getRegisterPage);

router.get("/forgot-password", sharedController.getForgotPasswordPage);
router.post("/forgot-password", sharedController.postForgotPassword);

router.get("/reset-password", sharedController.getResetPasswordPage);
router.post("/reset-password", sharedController.postResetPassword);

router.get("/profile", sharedController.getProfilePage);

router.get("/admin", requireAdmin, sharedController.getAdminPage);
router.post("/admin/password-resets/:requestId/resolve", requireAdmin, sharedController.postResolvePasswordReset);
router.post("/admin/password-resets/:requestId/reject", requireAdmin, sharedController.postRejectPasswordReset);

router.get("/admin/products/new", requireAdmin, sharedController.getProductFormPage);
router.get("/admin/products/:id/edit", requireAdmin, sharedController.getProductFormPage);
router.post("/admin/products", requireAdmin, uploadProductImages, sharedController.postCreateProduct);
router.post("/admin/products/:id", requireAdmin, uploadProductImages, sharedController.postUpdateProduct);
router.post("/admin/products/:id/toggle", requireAdmin, sharedController.postToggleProductStatus);
router.post("/admin/products/:id/delete", requireAdmin, sharedController.postDeleteProduct);

router.get("/sitemap", sharedController.getSitemapPage);

module.exports = router;
