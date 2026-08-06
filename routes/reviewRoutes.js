"use strict";

const express = require("express");

const productModel = require(
  "../models/productModel"
);

const router = express.Router();

const redirectLegacyProduct = (
  req,
  res
) => {
  const product =
    productModel.getProductByLegacyNumber(
      req.params.legacyNumber
    );

  if (!product) {
    return res
      .status(404)
      .send("Product not found.");
  }

  return res.redirect(301, product.href);
};

// There is no longer one global review page.
// Reviews now belong to a product resource.
router.get("/", (req, res) => {
  return res.redirect("/cart/products");
});

router.get(
  "/product-review",
  (req, res) => {
    return res.redirect("/cart/products");
  }
);

// Legacy local URLs:
// /review/review/1
router.get(
  "/review/:legacyNumber",
  redirectLegacyProduct
);

// /review/product_detail/review1
router.get(
  "/product_detail/review:legacyNumber",
  redirectLegacyProduct
);

// /review/product_detail/review/1
router.get(
  "/product_detail/review/:legacyNumber",
  redirectLegacyProduct
);

module.exports = router;
