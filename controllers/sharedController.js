"use strict";

const fs = require("fs");
const path = require("path");

const userModel = require("../models/userModel");
const orderModel = require("../models/orderModel");
const adminProductModel = require("../models/adminProductModel");
const passwordResetModel = require("../models/passwordResetModel");

const {
  generateTempPassword,
  hashPassword,
} = require("../utils/passwordUtils");

const {
  validateProduct,
} = require("../validators/productValidation");

const UPLOADS_URL_PREFIX = "/images/uploads/products/";
const IMAGE_SLOTS = ["image1", "image2", "image3"];


/* =========================
   PASSWORD
========================= */

const getForgotPasswordPage = (req, res) =>
  res.render("shared/forgot_password", {
    submitted: false,
  });

const postForgotPassword = async (req, res) => {
  const email = String(req.body.email || "").trim();

  const user = email
    ? await userModel.findUserByEmail(email)
    : null;

  if (user) {
    await passwordResetModel.createRequest(user.email);
  }

  return res.render("shared/forgot_password", {
    submitted: true,
  });
};

const getResetPasswordPage = (req, res) => {
  if (!req.session.user) {
    return res.redirect("/shared/login");
  }

  return res.render("shared/reset_password", {
    error: null,
  });
};

const postResetPassword = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/shared/login");
  }

  const {
    newPassword,
    confirmNewPassword,
  } = req.body;

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

  const user = await userModel.updateUser(
    req.session.user.id,
    {
      passwordHash: hashPassword(newPassword),
      requiresPasswordChange: false,
    }
  );

  if (!user) {
    return res.redirect("/shared/login");
  }

  return res.redirect(
    user.role === "admin"
      ? "/shared/admin"
      : "/shared/profile"
  );
};


/* =========================
   ADMIN
========================= */

const getAdminPage = async (req, res) => {
  const [
    products,
    users,
    pendingRequests,
    resolvedRequests,
  ] = await Promise.all([
    adminProductModel.getAllProducts(),
    userModel.getAllUsers(),
    passwordResetModel.getPendingRequests(),
    passwordResetModel.getResolvedRequests(),
  ]);

  return res.render("shared/admin/admin", {
    activePage: "admin",
    pendingRequests,
    resolvedRequests,
    products,

    productStats: {
      total: products.length,
      inStock: products.filter(
        (product) => Number(product.stock) > 0
      ).length,
      outOfStock: products.filter(
        (product) => Number(product.stock) <= 0
      ).length,
    },

    categories: adminProductModel.CATEGORIES,

    users,

    userStats: {
      total: users.length,
      active: users.filter(
        (user) => user.status !== "blocked"
      ).length,
      blocked: users.filter(
        (user) => user.status === "blocked"
      ).length,
    },

    activeTab: req.query.tab || "users",
    productNotice: req.query.notice || null,
  });
};

const postToggleUserStatus = async (req, res) => {
  const targetUser = await userModel.findById(
    req.params.id
  );

  if (
    targetUser &&
    targetUser.id !== req.currentUser.id
  ) {
    await userModel.updateUser(
      targetUser.id,
      {
        status:
          targetUser.status === "blocked"
            ? "active"
            : "blocked",
      }
    );
  }

  return res.redirect("/shared/admin?tab=users");
};


/* =========================
   PRODUCT HELPERS
========================= */

const buildProductsRedirect = (warnings = []) => {
  if (!warnings.length) {
    return "/shared/admin?tab=products";
  }

  return (
    "/shared/admin?tab=products&notice=" +
    encodeURIComponent(warnings.join(" "))
  );
};

const productFieldsFromBody = (body) => ({
  title: String(body.title || "").trim(),
  category: body.category || "",
  description: String(body.description || "").trim(),
  price: body.price,
  weightGram: body.weightGram,
  stock: body.stock,
  material: String(body.material || "").trim(),
  craftVillage: String(body.craftVillage || "").trim(),
});

const buildImagePaths = (
  existingImages = [],
  files = {}
) =>
  IMAGE_SLOTS.map((slot, index) => {
    const uploaded = files?.[slot]?.[0];

    return uploaded
      ? `${UPLOADS_URL_PREFIX}${uploaded.filename}`
      : existingImages[index] || "";
  });

const deleteManagedImage = (imagePath) => {
  if (!imagePath?.startsWith(UPLOADS_URL_PREFIX)) {
    return;
  }

  const filePath = path.join(
    __dirname,
    "..",
    "public",
    imagePath
  );

  fs.unlink(filePath, () => { });
};

const deleteManagedImageIfUnused = async (
  imagePath
) => {
  if (!imagePath) return;

  const usedInOrder =
    await orderModel.isImageUsedInOrders(imagePath);

  if (!usedInOrder) {
    deleteManagedImage(imagePath);
  }
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


/* =========================
   PRODUCT CRUD
========================= */

const getProductFormPage = async (req, res) => {
  const product = req.params.id
    ? await adminProductModel.findProductById(
      req.params.id
    )
    : null;

  if (req.params.id && !product) {
    return res.redirect(
      "/shared/admin?tab=products"
    );
  }

  return res.render("shared/admin/product_form", {
    product,
    categories: adminProductModel.CATEGORIES,
    craftVillages: adminProductModel.CRAFT_VILLAGES,
    materials: adminProductModel.MATERIALS,
    errors: [],
    warnings: [],
    formValues: null,
  });
};

const postCreateProduct = async (req, res) => {
  const images = buildImagePaths([], req.files);

  const fields = {
    ...productFieldsFromBody(req.body),
    images,
  };

  const { errors, warnings } =
    validateProduct(fields);

  if (req.uploadError) {
    errors.unshift(req.uploadError);
  }

  if (errors.length) {
    deleteUploadedFiles(req.files);

    return res.render("shared/admin/product_form", {
      product: null,
      categories: adminProductModel.CATEGORIES,
      craftVillages: adminProductModel.CRAFT_VILLAGES,
      materials: adminProductModel.MATERIALS,
      errors,
      warnings,
      formValues: req.body,
    });
  }

  await adminProductModel.createProduct({
    title: fields.title,
    category: fields.category,
    description: fields.description,
    images,
    price: Number(fields.price),
    weightGram: Number(fields.weightGram),
    stock: Number(fields.stock),
    material: fields.material,
    maker: fields.craftVillage,
  });

  return res.redirect(
    buildProductsRedirect(warnings)
  );
};

const postUpdateProduct = async (req, res) => {
  const { id } = req.params;

  const existing =
    await adminProductModel.findProductById(id);

  if (!existing) {
    deleteUploadedFiles(req.files);

    return res.redirect(
      "/shared/admin?tab=products"
    );
  }

  const images = buildImagePaths(
    existing.images || [],
    req.files
  );

  const fields = {
    ...productFieldsFromBody(req.body),
    images,
  };

  const { errors, warnings } =
    validateProduct(fields);

  if (req.uploadError) {
    errors.unshift(req.uploadError);
  }

  if (errors.length) {
    deleteUploadedFiles(req.files);

    return res.render("shared/admin/product_form", {
      product: existing,
      categories: adminProductModel.CATEGORIES,
      craftVillages: adminProductModel.CRAFT_VILLAGES,
      materials: adminProductModel.MATERIALS,
      errors,
      warnings,
      formValues: req.body,
    });
  }

  await adminProductModel.updateProduct(id, {
    title: fields.title,
    category: fields.category,
    description: fields.description,
    images,
    price: Number(fields.price),
    weightGram: Number(fields.weightGram),
    stock: Number(fields.stock),
    material: fields.material,
    maker: fields.craftVillage,
  });

  await Promise.all(
    (existing.images || []).map(
      async (oldImage, index) => {
        if (
          oldImage &&
          oldImage !== images[index]
        ) {
          await deleteManagedImageIfUnused(
            oldImage
          );
        }
      }
    )
  );

  return res.redirect(
    buildProductsRedirect(warnings)
  );
};

const postDeleteProduct = async (req, res) => {
  const product =
    await adminProductModel.deleteProduct(
      req.params.id
    );

  if (product) {
    await Promise.all(
      (product.images || []).map(
        deleteManagedImageIfUnused
      )
    );
  }

  return res.redirect(
    "/shared/admin?tab=products"
  );
};


/* =========================
   PASSWORD RESET ADMIN
========================= */

const postResolvePasswordReset = async (
  req,
  res
) => {
  const request =
    await passwordResetModel.findRequestById(
      req.params.requestId
    );

  if (request?.status === "pending") {
    const user =
      await userModel.findUserByEmail(
        request.email
      );

    if (user) {
      const tempPassword =
        generateTempPassword();

      await userModel.updateUser(
        user.id,
        {
          passwordHash:
            hashPassword(tempPassword),
          requiresPasswordChange:
            true,
        }
      );

      await passwordResetModel.resolveRequest(
        request.id,
        tempPassword
      );
    } else {
      await passwordResetModel.rejectRequest(
        request.id
      );
    }
  }

  return res.redirect("/shared/admin");
};

const postRejectPasswordReset = async (
  req,
  res
) => {
  await passwordResetModel.rejectRequest(
    req.params.requestId
  );

  return res.redirect("/shared/admin");
};

const postDeleteResolvedPasswordReset = async (
  req,
  res
) => {
  await passwordResetModel.deleteRequest(
    req.params.requestId
  );

  return res.redirect("/shared/admin");
};


/* =========================
   SITEMAP
========================= */

const getSitemapPage = (req, res) =>
  res.render("shared/sitemap");


module.exports = {
  getForgotPasswordPage,
  postForgotPassword,
  getResetPasswordPage,
  postResetPassword,
  getAdminPage,
  postToggleUserStatus,
  getProductFormPage,
  postCreateProduct,
  postUpdateProduct,
  postDeleteProduct,
  postResolvePasswordReset,
  postRejectPasswordReset,
  postDeleteResolvedPasswordReset,
  getSitemapPage,
};