const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const cartController = require("../controllers/cartController");

// GET Cart (optional auth for guest)
router.get("/", authenticateToken.optional, cartController.getCart);

// ADD to Cart (optional auth)
router.post("/", authenticateToken.optional, cartController.addToCart);

// UPDATE Quantity (optional auth)
router.put("/:cartId", authenticateToken.optional, cartController.updateCart);

// DELETE Cart Item (optional auth)
router.delete("/:cartId", authenticateToken.optional, cartController.deleteCartItem);

module.exports = router;
