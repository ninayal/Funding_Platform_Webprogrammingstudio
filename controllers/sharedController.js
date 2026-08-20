"use strict";

const fs = require("fs");
const path = require("path");

const userModel = require("../models/userModel");
const adminProductModel = require("../models/adminProductModel");
const passwordResetModel = require("../models/passwordResetModel");

const {
  generateTempPassword,
  hashPassword,
} = require("../utils/passwordUtils");

const { validateProduct } = require("../utils/productValidation");

const UPLOADS_URL_PREFIX = "/images/uploads/products/";
const IMAGE_SLOTS = ["image1", "image2", "image3"];

const getForgotPasswordPage = (req, res) =>
  res.render("shared/forgot_password", { submitted: false });

const postForgotPassword = (req, res) => {
  const email = String(req.body.email || "").trim();
  const user = email ? userModel.findUserByEmail(email) : null;

  if (user) passwordResetModel.createRequest(user.email);

  return res.render("shared/forgot_password", { submitted: true });
};

const getResetPasswordPage = (req, res) => {
  if (!req.session.user) return res.redirect("/shared/login");

  return res.render("shared/reset_password", { error: null });
};

const postResetPassword = (req, res) => {
  if (!req.session.user) return res.redirect("/shared/login");

  const { newPassword, confirmNewPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.render("shared/reset_password", {
      error: "Password must be at least 8 characters long.",
    });
  }

  if (newPassword !== confirmNewPassword) {
    return res.render("shared/reset_password", {
      error: "Passwords do not match.",
    });
  }

  const user = userModel.updateUser(req.session.user.id, {
    passwordHash: hashPassword(newPassword),
    requiresPasswordChange: false,
  });

  if (!user) return res.redirect("/shared/login");

  return res.redirect(
    user.role === "admin"
      ? "/shared/admin"
      : "/shared/profile"
  );
};

const getAdminPage = (req, res) => {
  const products = adminProductModel.getAllProducts();

  return res.render("shared/admin/admin", {
    pendingRequests: passwordResetModel.getPendingRequests(),
    resolvedRequests: passwordResetModel.getResolvedRequests(),
    products,
    productStats: {
      total: products.length,
      published: products.filter(
        (product) => product.status === "published"
      ).length,
      hidden: products.filter(
        (product) => product.status === "hidden"
      ).length,
    },
    categories: adminProductModel.CATEGORIES,
    activeTab: req.query.tab || "users",
    productNotice: req.query.notice || null,
  });
};

const buildProductsRedirect = (warnings = []) =>
  warnings.length
    ? `/shared/admin?tab=products&notice=${encodeURIComponent(
      warnings.join(" ")
    )}`
    : "/shared/admin?tab=products";

const productFieldsFromBody = (body) => ({
  title: String(body.title || "").trim(),
  category: body.category || "",
  description: String(body.description || "").trim(),
  price: body.price,
  weightGram: body.weightGram,
  stock: body.stock,
});

const buildImagePaths = (existingImages = [], files = {}) =>
  IMAGE_SLOTS.map((slot, index) => {
    const uploaded = files?.[slot]?.[0];
    return uploaded
      ? `${UPLOADS_URL_PREFIX}${uploaded.filename}`
      : existingImages[index] || "";
  });

const deleteManagedImage = (imagePath) => {
  if (!imagePath?.startsWith(UPLOADS_URL_PREFIX)) return;

  const filePath = path.join(
    __dirname,
    "..",
    "public",
    imagePath
  );

  fs.unlink(filePath, () => { });
};

const deleteUploadedFiles = (files = {}) => {
  IMAGE_SLOTS.forEach((slot) => {
    const uploaded = files?.[slot]?.[0];

    if (uploaded) {
      deleteManagedImage(
        `${UPLOADS_URL_PREFIX}${uploaded.filename}`
      );
    }
  });
};

const getProductFormPage = (req, res) => {
  const product = req.params.id
    ? adminProductModel.findProductById(req.params.id)
    : null;

  if (req.params.id && !product) {
    return res.redirect("/shared/admin?tab=products");
  }

  return res.render("shared/admin/product_form", {
    product,
    categories: adminProductModel.CATEGORIES,
    errors: [],
    warnings: [],
    formValues: null,
  });
};

const postCreateProduct = (req, res) => {
  const images = buildImagePaths([], req.files);
  const fields = {
    ...productFieldsFromBody(req.body),
    images,
  };

  const { errors, warnings } = validateProduct(fields);

  if (req.uploadError) errors.unshift(req.uploadError);

  if (errors.length) {
    deleteUploadedFiles(req.files);

    return res.render("shared/admin/product_form", {
      product: null,
      categories: adminProductModel.CATEGORIES,
      errors,
      warnings,
      formValues: req.body,
    });
  }

  adminProductModel.createProduct({
    title: fields.title,
    category: fields.category,
    description: fields.description,
    images,
    price: Number(fields.price),
    weightGram: Number(fields.weightGram),
    stock: Number(fields.stock),
    status: req.body.action === "publish"
      ? "published"
      : "hidden",
  });

  return res.redirect(buildProductsRedirect(warnings));
};

const postUpdateProduct = (req, res) => {
  const { id } = req.params;
  const existing = adminProductModel.findProductById(id);

  if (!existing) {
    deleteUploadedFiles(req.files);
    return res.redirect("/shared/admin?tab=products");
  }

  const images = buildImagePaths(existing.images, req.files);
  const fields = {
    ...productFieldsFromBody(req.body),
    images,
  };

  const { errors, warnings } = validateProduct(fields);

  if (req.uploadError) errors.unshift(req.uploadError);

  if (errors.length) {
    deleteUploadedFiles(req.files);

    return res.render("shared/admin/product_form", {
      product: existing,
      categories: adminProductModel.CATEGORIES,
      errors,
      warnings,
      formValues: req.body,
    });
  }

  existing.images.forEach((oldImage, index) => {
    if (oldImage && oldImage !== images[index]) {
      deleteManagedImage(oldImage);
    }
  });

  adminProductModel.updateProduct(id, {
    title: fields.title,
    category: fields.category,
    description: fields.description,
    images,
    price: Number(fields.price),
    weightGram: Number(fields.weightGram),
    stock: Number(fields.stock),
    status: req.body.action === "publish"
      ? "published"
      : "hidden",
  });

  return res.redirect(buildProductsRedirect(warnings));
};

const postToggleProductStatus = (req, res) => {
  const product = adminProductModel.findProductById(req.params.id);

  if (product) {
    adminProductModel.updateProduct(product.id, {
      status: product.status === "published"
        ? "hidden"
        : "published",
    });
  }

  return res.redirect("/shared/admin?tab=products");
};

const postDeleteProduct = (req, res) => {
  const product = adminProductModel.deleteProduct(req.params.id);

  if (product) {
    (product.images || []).forEach(deleteManagedImage);
  }

  return res.redirect("/shared/admin?tab=products");
};

const postResolvePasswordReset = (req, res) => {
  const request = passwordResetModel.findRequestById(
    req.params.requestId
  );

  if (request?.status === "pending") {
    const user = userModel.findUserByEmail(request.email);

    if (user) {
      const tempPassword = generateTempPassword();

      userModel.updateUser(user.id, {
        passwordHash: hashPassword(tempPassword),
        requiresPasswordChange: true,
      });

      passwordResetModel.resolveRequest(
        request.id,
        tempPassword
      );
    } else {
      passwordResetModel.rejectRequest(request.id);
    }
  }

  return res.redirect("/shared/admin");
};

const postRejectPasswordReset = (req, res) => {
  passwordResetModel.rejectRequest(req.params.requestId);
  return res.redirect("/shared/admin");
};

const postDeleteResolvedPasswordReset = (req, res) => {
  passwordResetModel.deleteRequest(req.params.requestId);
  return res.redirect("/shared/admin");
};

const postToggleUserStatus = (req, res) => {
  const user = userModel.findUserById(req.params.id);

  if (user) {
    userModel.updateUser(user.id, {
      status: user.status === "blocked"
        ? "active"
        : "blocked",
    });
  }

  return res.redirect("/shared/admin");
};

const getSitemapPage = (req, res) =>
  res.render("shared/sitemap");

module.exports = {
  getForgotPasswordPage,
  postForgotPassword,
  getResetPasswordPage,
  postResetPassword,
  getAdminPage,
  getProductFormPage,
  postCreateProduct,
  postUpdateProduct,
  postToggleProductStatus,
  postDeleteProduct,
  postResolvePasswordReset,
  postRejectPasswordReset,
  postDeleteResolvedPasswordReset,
  postToggleUserStatus,
  getSitemapPage,
};