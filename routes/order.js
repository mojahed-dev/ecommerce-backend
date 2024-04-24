const express = require("express");
const { placeOrder, getOrderedProducts, updateOrderStatus, getOrderedProduct } = require("../controllers/order");

const { verify, verifyAdmin } = require("../auth");

const router = express.Router();

// Placing an Order (authentication required)
router.post("/place-order", verify, placeOrder);

// Update order status (pending, shipped, delivered)
router.put("/status", verify, verifyAdmin, updateOrderStatus);

// View all ordered products/items (user authenticated required)
router.get("/", verify, getOrderedProducts);

// View all ordered products/items (admin authenticated required and status:delivered)
router.get("/all", verify, verifyAdmin,  getOrderedProduct);


module.exports = router;
