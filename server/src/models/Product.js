import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // Price shown on this storefront (includes store markup)
    price: { type: Number, required: true, min: 0 },
    // Original price from source marketplace
    originalPrice: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true, trim: true },
    supplierId: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    // Source marketplace info (e.g., Amazon, Temu)
    sourceName: { type: String, required: true, trim: true },
    sourceUrl: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
