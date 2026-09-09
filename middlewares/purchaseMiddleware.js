"use strict";

const Order = require("../models/schemas/Order");
const OrderItem = require("../models/schemas/OrderItem");
const productModel = require("../models/productModel");

const {
  getCurrentUser,
  renderProductDetail,
} = require("../controllers/productController");

const PURCHASE_REQUIRED_MESSAGE =
  "You need to purchase this product before writing a review.";

const cleanSingleLine = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim();

const cleanParagraph = (value) =>
  String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();

/**
 * Only users who have purchased the current product may create a review.
 *
 * Important: this middleware runs AFTER uploadReviewImages so Multer has
 * already parsed req.body. That allows us to re-render the review modal with
 * the user's rating/title/review text when access is denied.
 */
const requirePurchasedProduct = async (
  req,
  res,
  next
) => {
  try {
    const currentUser =
      getCurrentUser(req);

    // requireAuth should already handle this case.
    if (!currentUser) {
      return next();
    }

    const product =
      await productModel.getProductBySlug(
        req.params.slug
      );

    if (!product) {
      return res
        .status(404)
        .send("Product not found.");
    }

    // A purchase is considered valid once the order has been confirmed.
    // Later order states remain valid as well.
    const orders = await Order.find({
      userId: String(currentUser.id),
      status: {
        $in: [
          "confirmed",
          "shipped",
          "delivered",
        ],
      },
    })
      .select("_id")
      .lean();

    const orderIds = orders.map(
      (order) => String(order._id)
    );

    const purchasedItem =
      orderIds.length > 0
        ? await OrderItem.exists({
            orderId: {
              $in: orderIds,
            },
            itemType: "product",
            productId: String(product.id),
          })
        : null;

    if (purchasedItem) {
      return next();
    }

    // Keep the modal open and show the purchase warning INSIDE the form.
    // Browser file inputs cannot be repopulated after a server response, so
    // the uploaded image preview is intentionally not preserved.
    return await renderProductDetail(
      req,
      res,
      {
        product,
        statusCode: 403,
        openReviewTab: true,
        formOpen: true,

        formValues: {
          rating:
            Number(req.body?.rating) || "",
          reviewTitle:
            cleanSingleLine(
              req.body?.reviewTitle
            ),
          review:
            cleanParagraph(
              req.body?.review
            ),
          existingImages: [],
        },

        serverErrors: {
          purchase:
            PURCHASE_REQUIRED_MESSAGE,
        },
      }
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  PURCHASE_REQUIRED_MESSAGE,
  requirePurchasedProduct,
};
