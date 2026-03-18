import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import productsRouter from "./routes/products.js";
import productsSyncRouter from "./routes/productsSync.js";
import checkoutRouter from "./routes/checkout.js";
import mpesaRouter from "./routes/mpesa.js";
import searchRouter from "./routes/search.js";
import ordersRouter from "./routes/orders.js";

import {
  errorHandler,
  notFoundHandler,
  asyncHandler,
} from "./middleware/errorHandler.js";
import { requestLogger, securityHeaders, rateLimit } from "./middleware/logging.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(securityHeaders);
app.use(requestLogger);
app.use(rateLimit(200, 60000)); // 200 requests per minute
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", productsRouter);
app.use("/api/products", productsSyncRouter);
app.use("/api/search", searchRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/mpesa", mpesaRouter);

app.get('/api/health', (req, res) => res.status(200).send('OK'));

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

async function startServer() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI is not set in the environment.");
    console.error("   Create a .env file with: MONGO_URI=mongodb+srv://...");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { dbName: process.env.MONGO_DB_NAME || "dropshipping" });
    console.log("✅ Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API docs: http://localhost:${PORT}/api-docs (if enabled)`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
}

startServer();
