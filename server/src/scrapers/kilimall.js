import axios from "axios";
import { load } from "cheerio";

/**
 * Scrape products from Kilimall
 * URL: https://www.kilimall.com/ (or any category/search)
 */
export async function scrapeKilimall(url = "https://www.kilimall.com/") {
  try {
    console.log(`🔍 Scraping Kilimall from: ${url}`);

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      timeout: 15000,
    });

    const $ = load(data);
    const products = [];

    // Kilimall product cards selector
    $("div[class*='product'], article[class*='product'], li.product").each((i, el) => {
      if (products.length >= 20) return false;

      try {
        // Extract product name
        let name =
          $(el).find(".product-name, .prd-name, h2, [class*='title']").first().text().trim() ||
          $(el).find("a").attr("title");

        // Extract price
        let priceStr = $(el)
          .find(".product-price, .prc, .price, [class*='price']")
          .first()
          .text();
        priceStr = priceStr.replace(/[^0-9.]/g, "");

        // Extract image
        let imageUrl = $(el).find("img").attr("data-original") || $(el).find("img").attr("src");

        // Extract link
        let linkHref = $(el).find("a[href*='product'], a[href*='p/']").attr("href");
        if (!linkHref) {
          linkHref = $(el).find("a").first().attr("href");
        }

        const fullLink = linkHref ? `https://www.kilimall.com${linkHref}` : null;

        if (name && priceStr && imageUrl && fullLink) {
          const price = parseFloat(priceStr);
          if (!isNaN(price) && price > 0) {
            products.push({
              name: name.trim(),
              originalPrice: price,
              imageUrl: imageUrl.trim(),
              sourceUrl: fullLink,
              sourceName: "Kilimall",
              supplierId: "kilimall",
              description: `${name.trim()} - sourced from Kilimall`,
            });
          }
        }
      } catch (itemError) {
        console.warn("Error parsing item:", itemError.message);
      }
    });

    console.log(`✅ Scraped ${products.length} products from Kilimall`);
    return products;
  } catch (error) {
    console.error("❌ Kilimall scraping failed:", error.message);
    return [];
  }
}
