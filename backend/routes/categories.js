const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categoriesController");

// GET all categories
router.get("/", categoriesController.getCategories);

module.exports = router;
