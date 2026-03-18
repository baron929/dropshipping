import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const customerDetailsSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerDetails: { type: customerDetailsSchema, required: true },
    cartItems: { type: [cartItemSchema], required: true },
    totalPrice: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    fulfillmentStatus: {
      type: String,
      enum: ["pending", "processing", "fulfilled", "failed"],
      default: "pending",
    },
    // Store supplier responses (order IDs / tracking numbers) for post-order reconciliation
    supplierResponses: {
      type: [
        {
          supplier: String,
          success: Boolean,
          message: String,
          raw: mongoose.Schema.Types.Mixed,
        },
      ],
      default: [],
    },
    // M-Pesa payment details
    mpesaReceiptNumber: { type: String, default: null },
    mpesaTransactionDate: { type: String, default: null },
    mpesaPhoneNumber: { type: String, default: null },
    mpesaAmount: { type: Number, default: null },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
