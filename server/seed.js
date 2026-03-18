import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./src/models/Product.js";

dotenv.config();

const products = [
  {
    name: "Ergonomic Wireless Mouse",
    originalPrice: 25.99,
    price: Number((25.99 * 1.08).toFixed(2)),
    imageUrl: "https://via.placeholder.com/550x350?text=Ergonomic+Mouse",
    supplierId: "SUPPLIER-001",
    sourceName: "Amazon",
    sourceUrl:
      "https://www.amazon.com/s?k=Ergonomic+Wireless+Mouse",
    description: "A comfortable, ergonomic wireless mouse built for long work sessions.",
  },
  {
    name: "RGB Desk Mat",
    originalPrice: 22.99,
    price: Number((22.99 * 1.08).toFixed(2)),
    imageUrl: "https://via.placeholder.com/550x350?text=RGB+Desk+Mat",
    supplierId: "SUPPLIER-002",
    sourceName: "Temu",
    sourceUrl:
      "https://www.temu.com/search?keyword=RGB+Desk+Mat",
    description: "A large RGB desk mat with customizable lighting and non-slip base.",
  },
  {
    name: "Portable Laptop Stand",
    originalPrice: 32.99,
    price: Number((32.99 * 1.08).toFixed(2)),
    imageUrl: "https://via.placeholder.com/550x350?text=Laptop+Stand",
    supplierId: "SUPPLIER-003",
    sourceName: "Kilimall",
    sourceUrl:
      "https://www.kilimall.com/search?keyword=Portable+Laptop+Stand",
    description: "Adjustable aluminum laptop stand that improves ergonomics and cooling.",
  },
  {
    name: "Bluetooth Mechanical Keyboard",
    originalPrice: 74.99,
    price: Number((74.99 * 1.08).toFixed(2)),
    imageUrl: "https://via.placeholder.com/550x350?text=Mechanical+Keyboard",
    supplierId: "SUPPLIER-004",
    sourceName: "Jumia",
    sourceUrl:
      "https://www.jumia.com.ng/catalog/?q=Bluetooth+Mechanical+Keyboard",
    description: "A compact wireless mechanical keyboard with swappable switches.",
  },
  {
    name: "Smart LED Desk Lamp",
    originalPrice: 36.99,
    price: Number((36.99 * 1.08).toFixed(2)),
    imageUrl: "https://via.placeholder.com/550x350?text=LED+Desk+Lamp",
    supplierId: "SUPPLIER-005",
    sourceName: "Amazon",
    sourceUrl:
      "https://www.amazon.com/s?k=Smart+LED+Desk+Lamp",
    description: "A smart desk lamp with adjustable color temperature and USB charging.",
  },
];

async function runSeed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set in the environment (see .env.example)");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { dbName: process.env.MONGO_DB_NAME || "dropshipping" });
    console.log("✅ Connected to MongoDB");

    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing products. Skipping seed to avoid duplicates.`);
      process.exit(0);
    }

    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products.`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed database:", error);
    process.exit(1);
  }
}

runSeed();
