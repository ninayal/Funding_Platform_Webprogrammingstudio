const express = require("express");
const sharedController = require("../controllers/sharedController");
const uploadProductImages = require("../middlewares/uploadProductImages");

const router = express.Router();

router.get("/login", sharedController.getLoginPage);
router.post("/login", sharedController.postLogin);
router.post("/logout", sharedController.postLogout);

router.get("/register", sharedController.getRegisterPage);

router.get("/forgot-password", sharedController.getForgotPasswordPage);
router.post("/forgot-password", sharedController.postForgotPassword);

router.get("/reset-password", sharedController.getResetPasswordPage);
router.post("/reset-password", sharedController.postResetPassword);

router.get("/profile", sharedController.getProfilePage);

router.get("/admin", sharedController.getAdminPage);
router.post("/admin/password-resets/:requestId/resolve", sharedController.postResolvePasswordReset);
router.post("/admin/password-resets/:requestId/reject", sharedController.postRejectPasswordReset);

router.get("/admin/products/new", sharedController.getProductFormPage);
router.get("/admin/products/:id/edit", sharedController.getProductFormPage);
router.post("/admin/products", uploadProductImages, sharedController.postCreateProduct);
router.post("/admin/products/:id", uploadProductImages, sharedController.postUpdateProduct);
router.post("/admin/products/:id/toggle", sharedController.postToggleProductStatus);
router.post("/admin/products/:id/delete", sharedController.postDeleteProduct);

router.get("/sitemap", sharedController.getSitemapPage);

module.exports = router;
