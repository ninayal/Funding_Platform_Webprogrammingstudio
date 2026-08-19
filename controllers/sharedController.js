const fs = require("fs");
const path = require("path");
const userModel = require("../models/userModel");
const passwordResetModel = require("../models/passwordResetModel");
const productModel = require("../models/productModel");
const { generateTempPassword, hashPassword, verifyPassword } = require("../utils/passwordUtils");
const { validateProduct } = require("../utils/productValidation");

const getLoginPage = (req, res) => {
  res.render("shared/login", { error: null });
};

const postLogin = (req, res, next) => {
  const { email, password } = req.body;
  const user = email ? userModel.findUserByEmail(email) : null;

  if (!user || !verifyPassword(password || "", user.passwordHash)) {
    return res.render("shared/login", { error: "Incorrect email or password." });
  }

  if (user.status === "blocked") {
    return res.render("shared/login", { error: "This account has been blocked. Please contact support." });
  }

  // Regenerate the session id on login (prevents session fixation), matching
  // the auth flow already in place on main for the login/register routes.
  return req.session.regenerate((regenerateError) => {
    if (regenerateError) {
      return next(regenerateError);
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    return req.session.save((saveError) => {
      if (saveError) {
        return next(saveError);
      }

      if (user.requiresPasswordChange) {
        return res.redirect("/shared/reset-password");
      }

      return res.redirect(user.role === "admin" ? "/shared/admin" : "/shared/profile");
    });
  });
};

const postLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/shared/login");
  });
};

const getRegisterPage = (req, res) => {
  res.render("shared/register");
};

const getForgotPasswordPage = (req, res) => {
  res.render("shared/forgot_password", { submitted: false });
};

const postForgotPassword = (req, res) => {
  const { email } = req.body;
  const trimmedEmail = (email || "").trim();

  if (trimmedEmail) {
    const user = userModel.findUserByEmail(trimmedEmail);
    if (user) {
      passwordResetModel.createRequest(user.email);
    }
  }

  res.render("shared/forgot_password", { submitted: true });
};

const getResetPasswordPage = (req, res) => {
  if (!req.session.user) {
    return res.redirect("/shared/login");
  }
  res.render("shared/reset_password", { error: null });
};

const postResetPassword = (req, res) => {
  if (!req.session.user) {
    return res.redirect("/shared/login");
  }

  const { newPassword, confirmNewPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.render("shared/reset_password", { error: "Password must be at least 8 characters long." });
  }

  if (newPassword !== confirmNewPassword) {
    return res.render("shared/reset_password", { error: "Passwords do not match." });
  }

  const updatedUser = userModel.updateUser(req.session.user.id, {
    passwordHash: hashPassword(newPassword),
    requiresPasswordChange: false,
  });

  if (!updatedUser) {
    return res.redirect("/shared/login");
  }

  res.redirect(updatedUser.role === "admin" ? "/shared/admin" : "/shared/profile");
};

const getProfilePage = (req, res) => {
  res.render("shared/profile");
};

const getAdminPage = (req, res) => {
  const products = productModel.getAllProducts();

  res.render("shared/admin/admin", {
    pendingRequests: passwordResetModel.getPendingRequests(),
    resolvedRequests: passwordResetModel.getResolvedRequests(),
    products,
    productStats: {
      total: products.length,
      published: products.filter((product) => product.status === "published").length,
      hidden: products.filter((product) => product.status === "hidden").length,
    },
    categories: productModel.CATEGORIES,
    activeTab: req.query.tab || "users",
    productNotice: req.query.notice || null,
  });
};

const buildProductsRedirect = (warnings) => {
  if (warnings && warnings.length > 0) {
    return `/shared/admin?tab=products&notice=${encodeURIComponent(warnings.join(" "))}`;
  }
  return "/shared/admin?tab=products";
};

const productFieldsFromBody = (body) => ({
  title: (body.title || "").trim(),
  category: body.category || "",
  description: (body.description || "").trim(),
  price: body.price,
  weightGram: body.weightGram,
  stock: body.stock,
});

const UPLOADS_URL_PREFIX = "/images/uploads/products/";
const IMAGE_SLOTS = ["image1", "image2", "image3"];

// Fills each of the 3 image slots from a newly uploaded file, falling back to
// the product's existing image (edit) or blank (create) when no file was chosen.
const buildImagePaths = (existingImages, files) => {
  return IMAGE_SLOTS.map((slot, index) => {
    const uploaded = files && files[slot] && files[slot][0];
    if (uploaded) {
      return `${UPLOADS_URL_PREFIX}${uploaded.filename}`;
    }
    return (existingImages && existingImages[index]) || "";
  });
};

// Only ever deletes files this app uploaded itself, never the seeded /images/landingpics assets.
const deleteManagedImage = (imagePath) => {
  if (!imagePath || !imagePath.startsWith(UPLOADS_URL_PREFIX)) {
    return;
  }
  const absolutePath = path.join(__dirname, "..", "public", imagePath);
  fs.unlink(absolutePath, () => {});
};

const deleteUploadedFiles = (files) => {
  IMAGE_SLOTS.forEach((slot) => {
    const uploaded = files && files[slot] && files[slot][0];
    if (uploaded) {
      deleteManagedImage(`${UPLOADS_URL_PREFIX}${uploaded.filename}`);
    }
  });
};

const getProductFormPage = (req, res) => {
  const { id } = req.params;
  const product = id ? productModel.findProductById(id) : null;

  if (id && !product) {
    return res.redirect("/shared/admin?tab=products");
  }

  res.render("shared/admin/product_form", {
    product,
    categories: productModel.CATEGORIES,
    errors: [],
    warnings: [],
    formValues: null,
  });
};

const postCreateProduct = (req, res) => {
  const images = buildImagePaths([], req.files);
  const fields = { ...productFieldsFromBody(req.body), images };
  const { errors, warnings } = validateProduct(fields);
  if (req.uploadError) {
    errors.unshift(req.uploadError);
  }

  if (errors.length > 0) {
    deleteUploadedFiles(req.files);
    return res.render("shared/admin/product_form", {
      product: null,
      categories: productModel.CATEGORIES,
      errors,
      warnings,
      formValues: req.body,
    });
  }

  productModel.createProduct({
    title: fields.title,
    category: fields.category,
    description: fields.description,
    images,
    price: Number(fields.price),
    weightGram: Number(fields.weightGram),
    stock: Number(fields.stock),
    status: req.body.action === "publish" ? "published" : "hidden",
  });

  res.redirect(buildProductsRedirect(warnings));
};

const postUpdateProduct = (req, res) => {
  const { id } = req.params;
  const existing = productModel.findProductById(id);

  if (!existing) {
    deleteUploadedFiles(req.files);
    return res.redirect("/shared/admin?tab=products");
  }

  const images = buildImagePaths(existing.images, req.files);
  const fields = { ...productFieldsFromBody(req.body), images };
  const { errors, warnings } = validateProduct(fields);
  if (req.uploadError) {
    errors.unshift(req.uploadError);
  }

  if (errors.length > 0) {
    deleteUploadedFiles(req.files);
    return res.render("shared/admin/product_form", {
      product: existing,
      categories: productModel.CATEGORIES,
      errors,
      warnings,
      formValues: req.body,
    });
  }

  // Replaced images are gone for good — clean up the old uploaded files (seeded assets are skipped).
  existing.images.forEach((oldImage, index) => {
    if (oldImage && oldImage !== images[index]) {
      deleteManagedImage(oldImage);
    }
  });

  productModel.updateProduct(id, {
    title: fields.title,
    category: fields.category,
    description: fields.description,
    images,
    price: Number(fields.price),
    weightGram: Number(fields.weightGram),
    stock: Number(fields.stock),
    status: req.body.action === "publish" ? "published" : "hidden",
  });

  res.redirect(buildProductsRedirect(warnings));
};

const postToggleProductStatus = (req, res) => {
  const { id } = req.params;
  const product = productModel.findProductById(id);

  if (product) {
    productModel.updateProduct(id, {
      status: product.status === "published" ? "hidden" : "published",
    });
  }

  res.redirect("/shared/admin?tab=products");
};

const postDeleteProduct = (req, res) => {
  const { id } = req.params;
  const deleted = productModel.deleteProduct(id);
  if (deleted) {
    (deleted.images || []).forEach(deleteManagedImage);
  }
  res.redirect("/shared/admin?tab=products");
};

const postResolvePasswordReset = (req, res) => {
  const { requestId } = req.params;
  const request = passwordResetModel.findRequestById(requestId);

  if (request && request.status === "pending") {
    const user = userModel.findUserByEmail(request.email);

    if (user) {
      const tempPassword = generateTempPassword();
      userModel.updateUser(user.id, {
        passwordHash: hashPassword(tempPassword),
        requiresPasswordChange: true,
      });
      passwordResetModel.resolveRequest(requestId, tempPassword);
    } else {
      passwordResetModel.rejectRequest(requestId);
    }
  }

  res.redirect("/shared/admin");
};

const postRejectPasswordReset = (req, res) => {
  const { requestId } = req.params;
  passwordResetModel.rejectRequest(requestId);
  res.redirect("/shared/admin");
};

const getSitemapPage = (req, res) => {
  res.render("shared/sitemap");
};

module.exports = {
  getLoginPage,
  postLogin,
  postLogout,
  getRegisterPage,
  getForgotPasswordPage,
  postForgotPassword,
  getResetPasswordPage,
  postResetPassword,
  getProfilePage,
  getAdminPage,
  getProductFormPage,
  postCreateProduct,
  postUpdateProduct,
  postToggleProductStatus,
  postDeleteProduct,
  postResolvePasswordReset,
  postRejectPasswordReset,
  getSitemapPage,
};
