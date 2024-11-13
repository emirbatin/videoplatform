const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

router.get("/popular", categoryController.getPopularCategories);

module.exports = router;