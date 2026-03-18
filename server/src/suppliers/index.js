import * as amazon from "./amazon.js";
import * as temu from "./temu.js";
import * as kilimall from "./kilimall.js";
import * as jumia from "./jumia.js";

const ADAPTERS = {
  amazon,
  temu,
  kilimall,
  jumia,
};

export async function fetchProducts({ query, source, limit }) {
  const adapter = ADAPTERS[source];
  if (!adapter) throw new Error(`Unknown supplier source: ${source}`);
  return adapter.fetchProducts(query, { limit });
}

export async function fetchAllSources({ query, limitPerSource = 6 }) {
  const all = [];
  for (const source of Object.keys(ADAPTERS)) {
    try {
      const items = await ADAPTERS[source].fetchProducts(query, { limit: limitPerSource });
      all.push(...items);
    } catch (error) {
      console.warn(`Failed to fetch products from ${source}:`, error.message);
    }
  }
  return all;
}

export async function createOrder(order) {
  // Choose supplier integration based on first cart item supplierId if possible.
  const supplierId = order.cartItems?.[0]?.supplierId;
  const adapter = ADAPTERS[supplierId];
  if (!adapter || typeof adapter.createOrder !== "function") {
    return {
      supplier: supplierId || "unknown",
      success: false,
      message: "No supplier integration configured for this supplier.",
    };
  }
  return adapter.createOrder(order);
}
