import axios from "axios";
import cheerio from "cheerio";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function fetchProducts(query, { limit = 10 } = {}) {
  // Note: scraping Amazon web pages can be brittle and is against Amazon's terms of service.
  // For production, use Amazon Selling Partner API (SP-API) with proper credentials.

  const url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
  const response = await axios.get(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    timeout: 15000,
  });

  const $ = cheerio.load(response.data);
  const results = [];

  $("div[data-component-type='s-search-result']").each((_, el) => {
    if (results.length >= limit) return false;

    const title = $(el).find("h2 a span").text().trim();
    const link = $(el).find("h2 a").attr("href");
    const imageUrl = $(el).find("img").attr("src");
    const priceWhole = $(el).find("span.a-price-whole").first().text().replace(/[,$]/g, "");
    const priceFrac = $(el).find("span.a-price-fraction").first().text().replace(/[^0-9]/g, "");

    if (!title || !priceWhole) return;

    const price = Number(`${priceWhole}.${priceFrac || "00"}`);

    results.push({
      sourceName: "Amazon",
      sourceUrl: link ? `https://www.amazon.com${link}` : url,
      name: title,
      imageUrl: imageUrl || "https://via.placeholder.com/550x350?text=Amazon+Product",
      originalPrice: price,
      supplierId: "amazon",
      description: `Imported from Amazon search for '${query}'.`,
    });
  });

  return results;
}

export async function createOrder(order) {
  // Placeholder: implement Amazon SP-API order creation / drop-ship agent call.
  // Requires Amazon SP-API credentials (AWS access key, secret, role ARN, etc.).
  return {
    supplier: "Amazon",
    success: false,
    message: "No Amazon order integration configured.",
  };
}
