import express from "express";
import auth from "../middleware/auth.js";
import { addToCart, getCart } from "../controllers/cartController.js";

const router = express.Router();

router.post("/", auth, addToCart);
router.get("/", auth, getCart);

export default router;
