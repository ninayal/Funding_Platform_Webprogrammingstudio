const express = require("express");
const router = express.Router();
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
router.get("/", getCartPage);
router.post("/add", addToCart);
router.post("/update", updateCartItem);
router.post("/remove", removeCartItem);
router.get("/checkout", getCheckoutPage);
router.post("/checkout", submitCheckout);
router.get("/order-confirmation", getOrderConfirmationPage);
module.exports = router;