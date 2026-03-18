import express from "express";
import Product from "../models/Product.js";
import { validateSearch } from "../middleware/validation.js";

const router = express.Router();

/**
 * GET /api/search?q=keyword&limit=10&offset=0&minPrice=100&maxPrice=10000&source=Jumia
 * Search and filter products
 */
router.get("/", validateSearch, async (req, res) => {
  try {
    const { q, limit = 20, offset = 0, minPrice, maxPrice, source } = req.query;

    const query = {};

    // Search by name or description
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Filter by marketplace source
    if (source) {
      query.sourceName = source;
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .limit(parseInt(limit, 10))
      .skip(parseInt(offset, 10))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total,
      count: products.length,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      query: q || null,
      products,
    });
  } catch (error) {
    console.error("Search failed:", error);
    res.status(500).json({ success: false, message: "Search failed" });
  }
});

/**
 * GET /api/search/filters
 * Get available filters (price range, sources)
 */
router.get("/filters", async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          sources: { $push: "$sourceName" },
        },
      },
    ]);

    const metadata = stats[0] || {
      minPrice: 0,
      maxPrice: 0,
      sources: [],
    };

    // Get unique sources
    const unique_sources = [...new Set(metadata.sources)];

    res.json({
      success: true,
      minPrice: Math.floor(metadata.minPrice),
      maxPrice: Math.ceil(metadata.maxPrice),
      sources: unique_sources,
    });
  } catch (error) {
    console.error("Failed to fetch filters:", error);
    res.status(500).json({ success: false, message: "Failed to fetch filters" });
  }
});

export default router;
