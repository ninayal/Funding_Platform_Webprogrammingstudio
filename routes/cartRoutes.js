const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middlewares/authMiddleware");

const {
    getProductsPage,
    getCartPage,
    getCheckoutPage,
    getOrderConfirmationPage,
    addToCart,
    updateCartItem,
    removeCartItem,
    submitCheckout
} = require("../controllers/cartController");

router.get("/products", getProductsPage);

router.get("/", requireAuth, getCartPage);

router.post("/add", requireAuth, addToCart);
router.post("/update", requireAuth, updateCartItem);
router.post("/remove", requireAuth, removeCartItem);

router.get("/checkout", requireAuth, getCheckoutPage);
router.post("/checkout", requireAuth, submitCheckout);

router.get(
    "/order-confirmation",
    requireAuth,
    getOrderConfirmationPage
);

module.exports = router;