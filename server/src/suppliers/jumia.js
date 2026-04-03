import axios from "axios";
import { load } from "cheerio";

export async function fetchProducts(query, { limit = 10 } = {}) {
  const url = `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(query)}`;
  const response = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    timeout: 15000,
  });

  const $ = load(response.data);
  const results = [];

  $(".sku.-gallery").each((_, el) => {
    if (results.length >= limit) return false;

    const title = $(el).find(".name").text().trim();
    const link = $(el).find("a.link").attr("href");
    const imageUrl = $(el).find("img").attr("data-src") || $(el).find("img").attr("src");
    const priceText = $(el).find(".price span").first().text().replace(/[\s,₦]/g, "");

    const price = Number(priceText) || 0;

    if (!title) return;

    results.push({
      sourceName: "Jumia",
      sourceUrl: link ? `https://www.jumia.com.ng${link}` : url,
      name: title,
      imageUrl: imageUrl || "https://via.placeholder.com/550x350?text=Jumia+Product",
      originalPrice: price,
      supplierId: "jumia",
      description: `Imported from Jumia search for '${query}'.`,
    });
  });

  return results;
}

export async function createOrder(order) {
  // Placeholder: implement Jumia order API if available.
  return {
    supplier: "Jumia",
    success: false,
    message: "No Jumia order integration configured.",
  };
}
