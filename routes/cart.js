const express = require("express");
const { addToCart, removeProduct, updateCartItemQuantity, getCart } = require("../controllers/cart");

const { verify, verifyAdmin } = require("../auth");

const router = express.Router();

// Add Cart(authentication required)
router.post("/", verify, addToCart);

// Retrieve user cart
router.get("/my-cart", verify, getCart);

// Update Item Quantity(authentication required)
router.put("/", verify, updateCartItemQuantity);

// View cart(authentication required)
router.delete("/:productId", verify, removeProduct);




module.exports = router;