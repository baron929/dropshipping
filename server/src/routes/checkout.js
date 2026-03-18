import express from "express";
import Order from "../models/Order.js";
import fulfillmentTrigger from "../utils/fulfillmentTrigger.js";
import { validateCheckout } from "../middleware/validation.js";

const router = express.Router();

// POST /api/checkout
// Expected body: { customerDetails, cartItems, totalPrice }
// This endpoint creates an order and triggers fulfillment.
router.post("/", validateCheckout, async (req, res) => {
  const { customerDetails, cartItems, totalPrice } = req.body;

  if (!customerDetails || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ message: "Invalid order payload." });
  }

  // In a real production app, we'd validate address formats, run fraud checks,
  // and integrate with a payment gateway (Stripe/PayPal/etc.).

  try {
    const order = await Order.create({
      customerDetails,
      cartItems,
      totalPrice,
      paymentStatus: "pending",
      fulfillmentStatus: "pending",
    });

    // Placeholder for dropshipping fulfillment call.
    // This is where you'd send order details to a supplier API (AliExpress, POD, etc.).
    // The fulfillmentTrigger function is deliberately abstracted so it can be swapped out or mocked.
    fulfillmentTrigger(order)
      .then(() => {
        order.fulfillmentStatus = "processing";
        return order.save();
      })
      .catch((fulfillmentError) => {
        console.error("Fulfillment trigger failed:", fulfillmentError);
        order.fulfillmentStatus = "failed";
        return order.save();
      });

    res.status(201).json({ message: "Order created", orderId: order._id });
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ message: "Failed to create order." });
  }
});

export default router;
