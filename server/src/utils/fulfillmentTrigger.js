/**
 * fulfillmentTrigger
 *
 * Placeholder function for dropshipping supplier integration.
 * In a real implementation, this would call a supplier API (e.g., AliExpress Fastway, Printful, Printify)
 * to create a fulfillment order, then update the local order record with tracking info.
 *
 * For demo purposes, this returns a resolved promise after a short delay.
 */

import { createOrder } from "../suppliers/index.js";

export default async function fulfillmentTrigger(order) {
  console.log("[fulfillmentTrigger] received order", order._id);

  // Determine which supplier should fulfill the order based on the first cart item.
  // A more complete implementation would group by supplier and send an order to each.
  const result = await createOrder(order);

  // result should contain supplier response / tracking info.
  // In production, persist `result` into the order record (e.g., `supplierResponse`).
  return result;
}
