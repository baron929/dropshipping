import express from "express";
import { fetchAllSources } from "../suppliers/index.js";
import Product from "../models/Product.js";

const router = express.Router();

// GET /api/products/sync?query=keyword
// Fetches products from all configured marketplaces and upserts them.
router.get("/sync", async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ message: "query parameter is required" });
  }

  try {
    const items = await fetchAllSources({ query, limitPerSource: 5 });

    const upserts = items.map((item) => {
      const price = Number((item.originalPrice * 1.08).toFixed(2));

      return Product.updateOne(
        { supplierId: item.supplierId, sourceUrl: item.sourceUrl },
        {
          $set: {
            name: item.name,
            description: item.description,
            imageUrl: item.imageUrl,
            originalPrice: item.originalPrice,
            price,
            sourceName: item.sourceName,
            sourceUrl: item.sourceUrl,
          },
        },
        { upsert: true }
      );
    });

    await Promise.all(upserts);

    res.json({ success: true, imported: items.length });
  } catch (error) {
    console.error("Product sync failed:", error);
    res.status(500).json({ message: "Product sync failed." });
  }
});

export default router;
