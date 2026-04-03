import axios from "axios";
import { load } from "cheerio";

/**
 * Scrape products from Amazon (limited - Amazon blocking heavy scraping)
 * For production use, prefer Amazon Product Advertising API
 */
export async function scrapeAmazon(
  searchQuery = "laptop stand",
  maxProducts = 15
) {
  try {
    console.log(`🔍 Scraping Amazon for: "${searchQuery}"`);

    const url = `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}`;

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
      timeout: 15000,
    });

    const $ = load(data);
    const products = [];

    $("div[data-component-type='s-search-result']").each((i, el) => {
      if (products.length >= maxProducts) return false;

      try {
        const name = $(el).find("h2 a span").text().trim();
        const linkEl = $(el).find("h2 a").attr("href");
        const imageUrl = $(el).find("img").attr("src");

        let priceWhole = $(el).find("span.a-price-whole").first().text().replace(/[^0-9]/g, "");
        let priceFrac = $(el).find("span.a-price-fraction").first().text().replace(/[^0-9]/g, "");

        if (name && priceWhole) {
          const price = parseFloat(`${priceWhole}.${priceFrac || "00"}`);

          if (!isNaN(price) && price > 0) {
            products.push({
              name: name.trim(),
              originalPrice: price,
              imageUrl: imageUrl || "https://via.placeholder.com/550x350?text=Amazon+Product",
              sourceUrl: linkEl ? `https://www.amazon.com${linkEl}` : url,
              sourceName: "Amazon",
              supplierId: "amazon",
              description: `${name.trim()} - sourced from Amazon search "${searchQuery}"`,
            });
          }
        }
      } catch (itemError) {
        console.warn("Error parsing Amazon item:", itemError.message);
      }
    });

    console.log(`✅ Scraped ${products.length} products from Amazon`);
    return products;
  } catch (error) {
    console.error("❌ Amazon scraping failed:", error.message);
    return [];
  }
}
