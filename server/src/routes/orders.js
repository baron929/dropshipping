import express from "express";
import Order from "../models/Order.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

/**
 * GET /api/orders/:orderId
 * Get single order details
 */
router.get(
  "/:orderId",
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      order: {
        id: order._id,
        status: order.fulfillmentStatus,
        paymentStatus: order.paymentStatus,
        total: order.totalPrice,
        customer: order.customerDetails,
        items: order.cartItems,
        mpesaReceiptNumber: order.mpesaReceiptNumber,
        supplierResponses: order.supplierResponses,
        createdAt: order.createdAt,
      },
    });
  })
);

/**
 * GET /api/orders/email/:email
 * Get all orders for a customer email
 */
router.get(
  "/email/:email",
  asyncHandler(async (req, res) => {
    const orders = await Order.find({
      "customerDetails.email": req.params.email,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders: orders.map((order) => ({
        id: order._id,
        status: order.fulfillmentStatus,
        total: order.totalPrice,
        createdAt: order.createdAt,
        mpesaReceiptNumber: order.mpesaReceiptNumber,
      })),
    });
  })
);

/**
 * GET /api/orders/stats/:orderId
 * Get order status (for polling)
 */
router.get(
  "/stats/:orderId",
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      orderId: order._id,
      fulfillmentStatus: order.fulfillmentStatus,
      paymentStatus: order.paymentStatus,
      mpesaReceiptNumber: order.mpesaReceiptNumber || null,
      suppliers: order.supplierResponses.map((r) => ({
        name: r.supplier,
        status: r.success ? "sent" : "failed",
        message: r.message,
      })),
    });
  })
);

export default router;
