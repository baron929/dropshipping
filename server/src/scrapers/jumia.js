import axios from "axios";
import cheerio from "cheerio";

/**
 * Scrape products from Jumia Kenya
 * URL: https://www.jumia.co.ke/flash-sales/ (or any category)
 */
export async function scrapeJumia(url = "https://www.jumia.co.ke/flash-sales/") {
  try {
    console.log(`🔍 Scraping Jumia from: ${url}`);

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const products = [];

    // Jumia product cards selector
    $("article.prd, article[data-sku], div[data-sku]").each((i, el) => {
      if (products.length >= 20) return false; // Limit to 20 products

      try {
        // Different ways to extract based on HTML structure
        let name = $(el).find(".name, .prd-name, a[title]").attr("title");
        if (!name) {
          name = $(el).find(".name, .prd-name").text().trim();
        }

        let priceStr = $(el).find(".prc, .price, span[data-price]").first().text();
        priceStr = priceStr.replace(/[^0-9.]/g, "");

        let imageUrl = $(el).find("img.img, img[data-src]").attr("data-src");
        if (!imageUrl) {
          imageUrl = $(el).find("img").attr("src");
        }

        let linkHref = $(el).find("a.core, a[href*='/p/']").attr("href");
        if (!linkHref) {
          linkHref = $(el).find("a").first().attr("href");
        }

        const fullLink = linkHref ? `https://www.jumia.co.ke${linkHref}` : null;

        if (name && priceStr && imageUrl && fullLink) {
          const price = parseFloat(priceStr);
          if (!isNaN(price) && price > 0) {
            products.push({
              name: name.trim(),
              originalPrice: price,
              imageUrl: imageUrl.trim(),
              sourceUrl: fullLink,
              sourceName: "Jumia",
              supplierId: "jumia",
              description: `${name.trim()} - sourced from Jumia Kenya`,
            });
          }
        }
      } catch (itemError) {
        console.warn("Error parsing item:", itemError.message);
      }
    });

    console.log(`✅ Scraped ${products.length} products from Jumia`);
    return products;
  } catch (error) {
    console.error("❌ Jumia scraping failed:", error.message);
    return [];
  }
}
