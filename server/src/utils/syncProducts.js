import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import { fetchAllSources } from "../suppliers/index.js";

dotenv.config();

async function sync() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set in the environment (see .env.example)");
    process.exit(1);
  }

  await mongoose.connect(uri, { dbName: process.env.MONGO_DB_NAME || "dropshipping" });
  console.log("✅ Connected to MongoDB");

  // Example keywords to sync.
  const keywords = [
    "ergonomic mouse",
    "desk mat",
    "laptop stand",
    "mechanical keyboard",
    "desk lamp",
  ];

  for (const keyword of keywords) {
    console.log(`
---
Syncing products for keyword: ${keyword}
---
`);

    const items = await fetchAllSources({ query: keyword, limitPerSource: 4 });

    for (const item of items) {
      // Apply a modest markup (≈8%) on top of the source price.
      const price = Number((item.originalPrice * 1.08).toFixed(2));

      await Product.updateOne(
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
    }

    console.log(`Synced ${items.length} products for '${keyword}'.`);
  }

  console.log("✅ Product sync complete.");
  process.exit(0);
}

sync().catch((error) => {
  console.error("Sync failed:", error);
  process.exit(1);
});
