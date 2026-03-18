# Dropshipping Boilerplate (React + Express + MongoDB)

This repository provides a minimal, production-ready boilerplate for a dropshipping middleman storefront.

## ✅ Project Architecture

**Root folder**
- `client/` – React + Tailwind frontend
- `server/` – Express API + MongoDB (Mongoose)

## 🧱 Setup (Local Development)

1. **Copy environment variables**
   - `server/.env.example` → `server/.env`
   - `client/.env.example` → `client/.env` (optional)

2. **Install dependencies**

   ```bash
   cd server
   npm install

   cd ../client
   npm install
   ```

3. **Seed sample products**

   Make sure `MONGO_URI` is set in `server/.env`.

   ```bash
   cd server
   npm run seed
   ```

4. **(Optional) Scrape & Seed from Marketplaces**

   Automatically import products from Jumia, Kilimall, Amazon with pricing markup:

   ```bash
   cd server
   npm run scrape:jumia    # Just Jumia flash sales
   # or
   npm run scrape          # All marketplaces
   ```

   See [SCRAPING_GUIDE.md](SCRAPING_GUIDE.md) for details.

5. **Run the backend**

   ```bash
   cd server
   npm run dev
   ```

5. **Run the frontend**

   ```bash
   cd ../client
   npm run dev
   ```

6. Open `http://localhost:5173` in your browser.

---

## 🔌 Environment Variables (Server)

Required:
- `MONGO_URI` - MongoDB connection string
- `PORT` - (optional) port for Express (defaults to `5000`)
- `MONGO_DB_NAME` - (optional) database name (defaults to `dropshipping`)

## �️ Product Source & Markup

Products are seeded with a `sourceUrl` that points to marketplaces such as Amazon / Temu / Kilimall / Jumia. The app stores both the `originalPrice` (source marketplace price) and `price` (the store’s sale price). The sale price is a small markup on top of the original price.

## �💡 Dropshipping Logic (Backend)

- `/api/products` - Fetch all products.
- `/api/checkout` - Accepts cart payload and creates an order.
- `fulfillmentTrigger()` in `server/src/utils/fulfillmentTrigger.js` is where supplier API calls would happen.

---

## 🧩 Structure Summary

### Backend (`server/`)
- `src/models/` – Mongoose schemas for `Product` and `Order`
- `src/routes/` – API route handlers
- `seed.js` – Seed script to populate MongoDB

### Frontend (`client/`)
- `src/context/CartContext.jsx` – Cart state (Zustand-like API without extra deps)
- `src/components/` – UI: Navbar, ProductGrid, CartDrawer, CheckoutForm
- Tailwind for responsive styling

---

If you'd like, I can also add:
- Payment gateway integration (Stripe, PayPal)
- Supplier API integration example (AliExpress, Printify)
- Auth/Registration for customers and admins
