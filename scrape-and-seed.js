import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./src/models/Product.js";
import { scrapeJumia } from "./src/scrapers/jumia.js";
import { scrapeKilimall } from "./src/scrapers/kilimall.js";
import { scrapeAmazon } from "./src/scrapers/amazon.js";

dotenv.config();

/**
 * Master seeding script
 * Scrapes products from multiple marketplaces and seeds MongoDB
 * Usage: npm run scrape-and-seed
 */

const MARKUP_PERCENTAGE = 1.08; // 8% markup on marketplace prices

async function scrapeAllAndSeed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI is not set in .env");
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(uri, { dbName: process.env.MONGO_DB_NAME || "dropshipping" });
    console.log("✅ Connected to MongoDB\n");

    // Clear existing scraped products (optional - comment out to keep old data)
    // const deleted = await Product.deleteMany({ sourceName: { $in: ["Jumia", "Kilimall", "Amazon"] } });
    // console.log(`🗑️  Cleared ${deleted.deletedCount} old products\n`);

    const allProducts = [];

    // Scrape Jumia
    console.log("=== JUMIA ===");
    const jumiaProducts = await scrapeJumia("https://www.jumia.co.ke/flash-sales/");
    allProducts.push(...jumiaProducts);
    console.log();

    // Scrape Kilimall
    console.log("=== KILIMALL ===");
    const kilimallProducts = await scrapeKilimall("https://www.kilimall.com/");
    allProducts.push(...kilimallProducts);
    console.log();

    // Scrape Amazon (with search queries)
    console.log("=== AMAZON ===");
    const amazonQueries = [
      "ergonomic mouse",
      "desk mat",
      "laptop stand",
      "mechanical keyboard",
      "desk lamp",
    ];
    for (const query of amazonQueries) {
      const amazonProducts = await scrapeAmazon(query, 3);
      allProducts.push(...amazonProducts);
    }
    console.log();

    // Apply markup and save to database
    console.log("💾 Saving to database...\n");
    let upsertCount = 0;

    for (const product of allProducts) {
      // Apply markup
      const price = Number((product.originalPrice * MARKUP_PERCENTAGE).toFixed(2));

      const result = await Product.findOneAndUpdate(
        {
          sourceName: product.sourceName,
          sourceUrl: product.sourceUrl,
        },
        {
          $set: {
            name: product.name,
            originalPrice: product.originalPrice,
            price,
            imageUrl: product.imageUrl,
            supplierId: product.supplierId,
            sourceName: product.sourceName,
            sourceUrl: product.sourceUrl,
            description: product.description,
          },
        },
        { upsert: true, new: true }
      );

      if (result) {
        upsertCount++;
      }
    }

    // Summary
    console.log("\n=== SEED COMPLETE ===");
    console.log(`✅ Total products scraped: ${allProducts.length}`);
    console.log(`💾 Total products upserted: ${upsertCount}`);
    console.log(`📈 Markup applied: ${((MARKUP_PERCENTAGE - 1) * 100).toFixed(0)}%`);

    const allCount = await Product.countDocuments();
    console.log(`📊 Total products in DB: ${allCount}\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

scrapeAllAndSeed();
