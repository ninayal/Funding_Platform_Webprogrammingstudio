const express = require("express");

const cartController = require("../controllers/cartController");

const router = express.Router();

router.get("/products", cartController.getProductsPage);
router.get("/", cartController.getCartPage);
router.get("/checkout", cartController.getCheckoutPage);
router.get("/order-confirmation", cartController.getOrderConfirmationPage);

module.exports = router;