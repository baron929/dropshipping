import express from "express";
import Order from "../models/Order.js";
import { initiateSTKPush, parseCallback } from "../utils/mpesa.js";
import { fulfillJumiaOrder, fulfillKilimallOrder } from "../utils/suppliers.js";
import { validateMpesaSTK } from "../middleware/validation.js";

const router = express.Router();

/**
 * POST /api/mpesa/stk
 * Initiates an M-Pesa STK Push
 * Body: { phoneNumber, amount, orderId }
 */
router.post("/stk", validateMpesaSTK, async (req, res) => {
  const { phoneNumber, amount, orderId } = req.body;

  if (!phoneNumber || !amount || !orderId) {
    return res.status(400).json({ message: "phoneNumber, amount, and orderId are required" });
  }

  try {
    // Ensure order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Initiate STK Push
    const result = await initiateSTKPush({ phoneNumber, amount, orderId });

    res.json({
      success: true,
      message: "STK Push initiated. Check your phone for M-Pesa prompt.",
      checkoutRequestID: result.CheckoutRequestID,
      requestId: result.RequestId,
    });
  } catch (error) {
    console.error("STK Push failed:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/mpesa/callback
 * M-Pesa calls this endpoint after user responds to STK prompt
 * Parses the callback, updates order status, and triggers supplier fulfillment
 */
router.post("/callback", async (req, res) => {
  try {
    const callbackData = parseCallback(req.body);

    console.log("[M-Pesa Callback]", callbackData);

    // If payment failed, return 200 OK to M-Pesa to stop retries
    if (!callbackData.success) {
      console.warn("M-Pesa payment failed:", callbackData.resultDesc);
      
      // Update order status to 'Failed'
      try {
        const order = await Order.findOne({ _id: req.body.Body?.stkCallback?.MerchantRequestID });
        if (order) {
          order.paymentStatus = "failed";
          await order.save();
        }
      } catch (e) {
        // Order update failed, but don't crash
      }

      return res.status(200).json({ ResultCode: 0, ResultDesc: "Callback received" });
    }

    // Payment succeeded
    // Find order by accountReference (which we set to orderId)
    const orderId = req.body.Body?.stkCallback?.MerchantRequestID;
    if (!orderId) {
      return res.status(200).json({ ResultCode: 0, ResultDesc: "No order ID found" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(200).json({ ResultCode: 0, ResultDesc: "Order not found" });
    }

    // Update order status
    order.paymentStatus = "paid";
    order.fulfillmentStatus = "processing";
    order.supplierResponses = order.supplierResponses || [];

    // Extract M-Pesa details
    order.mpesaReceiptNumber = callbackData.mpesaReceiptNumber;
    order.mpesaTransactionDate = callbackData.transactionDate;
    order.mpesaPhoneNumber = callbackData.phoneNumber;
    order.mpesaAmount = callbackData.amount;

    // Trigger supplier fulfillment
    try {
      // Call Jumia (if applicable)
      const jumiaResult = await fulfillJumiaOrder(order);
      order.supplierResponses.push(jumiaResult);
      console.log("Jumia response:", jumiaResult);
    } catch (error) {
      console.error("Jumia fulfillment error:", error.message);
      order.supplierResponses.push({
        supplier: "Jumia",
        success: false,
        message: error.message,
      });
    }

    // Call Kilimall (if applicable)
    try {
      const kilimallResult = await fulfillKilimallOrder(order);
      order.supplierResponses.push(kilimallResult);
      console.log("Kilimall response:", kilimallResult);
    } catch (error) {
      console.error("Kilimall fulfillment error:", error.message);
      order.supplierResponses.push({
        supplier: "Kilimall",
        success: false,
        message: error.message,
      });
    }

    // Save updated order
    await order.save();

    res.status(200).json({ ResultCode: 0, ResultDesc: "Callback received and processed" });
  } catch (error) {
    console.error("Callback processing error:", error);
    res.status(200).json({ ResultCode: 0, ResultDesc: "Callback received" });
  }
});

/**
 * GET /api/mpesa/status/:orderId
 * Check the current payment status of an order
 */
router.get("/status/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      mpesaReceiptNumber: order.mpesaReceiptNumber || null,
      supplierResponses: order.supplierResponses || [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
