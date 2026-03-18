#!/usr/bin/env node

/**
 * Quick Jumia Flash Sales Scraper
 * 
 * Scrapes https://www.jumia.co.ke/flash-sales/ and seeds to MongoDB
 * 
 * Usage: 
 *   node scrapeJumiaFlashSales.js
 *   # or from root: npm run scrape:jumia
 */

import axios from "axios";
import cheerio from "cheerio";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./src/models/Product.js";

dotenv.config();

const JUMIA_URL = "https://www.jumia.co.ke/flash-sales/";
const MARKUP_PERCENTAGE = 1.08; // 8% markup

async function scrapeAndSeed() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error("❌ MONGO_URI not set in .env");
      process.exit(1);
    }

    await mongoose.connect(uri, { dbName: process.env.MONGO_DB_NAME || "dropshipping" });
    console.log("✅ Connected to MongoDB");

    console.log(`🔍 Scraping Jumia Flash Sales: ${JUMIA_URL}\n`);

    const { data } = await axios.get(JUMIA_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const scrapedProducts = [];

    // Jumia's product card structure - try multiple selectors for robustness
    const selectors = ["article.prd", "div[data-sku]", "article[data-sku]"];
    
    for (const selector of selectors) {
      $(selector).each((i, el) => {
        if (scrapedProducts.length >= 15) return false;

        try {
          // Extract name
          let name = $(el).find(".name").text().trim();
          if (!name) name = $(el).find("a[title]").attr("title");

          // Extract price (Jumia shows KSh)
          let priceStr = $(el)
            .find(".prc")
            .text()
            .replace(/KSh\s*/g, "")
            .replace(/,/g, "")
            .trim();

          // Extract image
          const image = $(el).find("img.img").attr("data-src") || $(el).find("img").attr("src");

          // Extract link
          let linkHref = $(el).find("a.core").attr("href");
          if (!linkHref) {
            linkHref = $(el).find("a").first().attr("href");
          }

          const link = linkHref ? `https://www.jumia.co.ke${linkHref}` : JUMIA_URL;
          const price = parseFloat(priceStr);

          // Validate and add product
          if (name && !isNaN(price) && price > 0 && image) {
            scrapedProducts.push({
              name,
              originalPrice: price,
              price: Number((price * MARKUP_PERCENTAGE).toFixed(2)),
              imageUrl: image.trim(),
              sourceUrl: link,
              sourceName: "Jumia",
              supplierId: "jumia",
              description: `${name} - Flash sale on Jumia Kenya`,
            });

            console.log(
              `  ✓ ${name.substring(0, 50)}... - KSh ${price} → KSh ${Number(
                (price * MARKUP_PERCENTAGE).toFixed(2)
              )}`
            );
          }
        } catch (err) {
          // Skip malformed items silently
        }
      });

      if (scrapedProducts.length > 0) break;
    }

    if (scrapedProducts.length === 0) {
      console.warn("⚠️  No products scraped. Jumia HTML structure may have changed.");
      process.exit(0);
    }

    console.log(`\n💾 Saving ${scrapedProducts.length} products to database...\n`);

    let upsertCount = 0;
    for (const product of scrapedProducts) {
      const result = await Product.findOneAndUpdate(
        { sourceName: "Jumia", sourceUrl: product.sourceUrl },
        { $set: product },
        { upsert: true }
      );

      if (result) upsertCount++;
    }

    console.log(`\n✅ Success!`);
    console.log(`   Scraped: ${scrapedProducts.length} products`);
    console.log(`   Saved: ${upsertCount} products`);
    console.log(`   Markup: ${((MARKUP_PERCENTAGE - 1) * 100).toFixed(0)}%\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

scrapeAndSeed();
