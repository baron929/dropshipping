import axios from "axios";
import { load } from "cheerio";

export async function fetchProducts(query, { limit = 10 } = {}) {
  const url = `https://www.kilimall.com/search?keyword=${encodeURIComponent(query)}`;
  const response = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    timeout: 15000,
  });

  const $ = load(response.data);
  const results = [];

  $(".product-list .product-item").each((_, el) => {
    if (results.length >= limit) return false;

    const title = $(el).find(".product-name").text().trim();
    const link = $(el).find(".product-name a").attr("href");
    const imageUrl = $(el).find(".product-img img").attr("data-original") || $(el).find(".product-img img").attr("src");
    const priceText = $(el).find(".product-price .price").first().text().replace(/[,$]/g, "");

    const price = Number(priceText) || 0;

    if (!title) return;

    results.push({
      sourceName: "Kilimall",
      sourceUrl: link ? `https://www.kilimall.com${link}` : url,
      name: title,
      imageUrl: imageUrl || "https://via.placeholder.com/550x350?text=Kilimall+Product",
      originalPrice: price,
      supplierId: "kilimall",
      description: `Imported from Kilimall search for '${query}'.`,
    });
  });

  return results;
}

export async function createOrder(order) {
  // Placeholder: implement Kilimall order API if available.
  return {
    supplier: "Kilimall",
    success: false,
    message: "No Kilimall order integration configured.",
  };
}
