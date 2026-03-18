import axios from "axios";

/**
 * fulfillJumiaOrder
 *
 * Sends order details to Jumia Vendor Center API to create a draft order.
 * The fulfillment status can then be tracked in Jumia's dashboard.
 *
 * Jumia v2/orders endpoint expects:
 * - customer_name: string
 * - customer_email: string
 * - customer_phone: string
 * - shipping_address: { street, city, state, postal_code, country }
 * - items: [{ sku, quantity, price }]
 * - total_amount: number
 */
export async function fulfillJumiaOrder(order) {
  const apiKey = process.env.JUMIA_API_KEY;
  const vendorId = process.env.JUMIA_VENDOR_ID;

  if (!apiKey || !vendorId) {
    console.warn("Jumia credentials not configured. Skipping Jumia fulfillment.");
    return {
      success: false,
      message: "Jumia API credentials not configured",
    };
  }

  try {
    // Construct Jumia order payload from our Order schema
    const jumiaPayload = {
      customer_name: order.customerDetails.fullName,
      customer_email: order.customerDetails.email,
      customer_phone: order.customerDetails.phone,
      shipping_address: {
        street: order.customerDetails.addressLine1,
        city: order.customerDetails.city,
        state: order.customerDetails.state,
        postal_code: order.customerDetails.postalCode,
        country: order.customerDetails.country,
      },
      items: order.cartItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total_amount: order.totalPrice,
      merchant_reference: order._id.toString(),
    };

    // POST to Jumia v2/orders endpoint
    // Jumia API docs: https://docs.jumia.com/vendor-center/api/orders
    const response = await axios.post("https://api.jumia.com/v2/orders", jumiaPayload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    return {
      success: true,
      supplier: "Jumia",
      orderId: response.data.order_id || response.data.id,
      message: "Order sent to Jumia for fulfillment",
      raw: response.data,
    };
  } catch (error) {
    console.error("Jumia fulfillment failed:", error.message);
    return {
      success: false,
      supplier: "Jumia",
      message: error.message,
      error: error.response?.data || null,
    };
  }
}

/**
 * fulfillKilimallOrder
 *
 * Sends order details to Kilimall OpenAPI to create a draft order.
 *
 * Kilimall OpenAPI endpoint expects:
 * - seller_name: string
 * - seller_email: string
 * - seller_phone: string
 * - delivery_address: { street, city, region, postal_code, country }
 * - products: [{ product_id, quantity, price }]
 */
export async function fulfillKilimallOrder(order) {
  const apiKey = process.env.KILIMALL_API_KEY;
  const sellerId = process.env.KILIMALL_SELLER_ID;

  if (!apiKey || !sellerId) {
    console.warn("Kilimall credentials not configured. Skipping Kilimall fulfillment.");
    return {
      success: false,
      message: "Kilimall API credentials not configured",
    };
  }

  try {
    // Construct Kilimall order payload
    const kilimallPayload = {
      seller_name: order.customerDetails.fullName,
      seller_email: order.customerDetails.email,
      seller_phone: order.customerDetails.phone,
      delivery_address: {
        street: order.customerDetails.addressLine1,
        city: order.customerDetails.city,
        region: order.customerDetails.state,
        postal_code: order.customerDetails.postalCode,
        country: order.customerDetails.country,
      },
      products: order.cartItems.map((item) => ({
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total_price: order.totalPrice,
      reference: order._id.toString(),
    };

    // POST to Kilimall openapi/orders endpoint
    // Kilimall API docs: https://openapi.kilimall.com/docs
    const response = await axios.post("https://openapi.kilimall.com/v1/orders", kilimallPayload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    return {
      success: true,
      supplier: "Kilimall",
      orderId: response.data.order_id || response.data.id,
      message: "Order sent to Kilimall for fulfillment",
      raw: response.data,
    };
  } catch (error) {
    console.error("Kilimall fulfillment failed:", error.message);
    return {
      success: false,
      supplier: "Kilimall",
      message: error.message,
      error: error.response?.data || null,
    };
  }
}
