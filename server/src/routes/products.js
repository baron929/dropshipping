import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// GET /api/products
// Returns a list of products available in the catalog.
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    res.status(500).json({ message: "Failed to fetch products." });
  }
});

export default router;
