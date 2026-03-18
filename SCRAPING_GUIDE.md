# Product Scraping Guide

This guide explains how to scrape products from Jumia, Kilimall, Amazon, and other marketplaces to automatically populate your dropshipping store.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Set Up MongoDB
Ensure `MONGO_URI` is set in `server/.env`:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net
MONGO_DB_NAME=dropshipping
```

### 3. Run a Scraper

#### Option A: Scrape Jumia Flash Sales (Quickest)
```bash
cd server
npm run scrape:jumia
```

#### Option B: Scrape Multiple Marketplaces
```bash
cd server
npm run scrape
```

#### Option C: Manual Single Scraper
```bash
cd server
node scrapeJumiaFlashSales.js
```

---

## 📊 Available Scrapers

### 1. Jumia (Kenya) - `scrapeJumiaFlashSales.js`
**What it scrapes:**
- Product name, price, image
- Flash sales from Jumia Kenya
- Stores original price + 8% markup

**Usage:**
```bash
npm run scrape:jumia
```

**Output:**
```
✅ Connected to MongoDB
🔍 Scraping Jumia Flash Sales: https://www.jumia.co.ke/flash-sales/

  ✓ Samsung 55" TV... - KSh 45000 → KSh 48600
  ✓ Infinix Phone... - KSh 15000 → KSh 16200
  ... more products ...

✅ Success!
   Scraped: 10 products
   Saved: 10 products
   Markup: 8%
```

---

### 2. Multi-Marketplace Scraper - `scrape-and-seed.js`
Scrapes from **Jumia**, **Kilimall**, and **Amazon** in one go.

**Usage:**
```bash
npm run scrape
# From root: npm --prefix server run scrape
```

**What it does:**
1. Scrapes Jumia flash sales
2. Scrapes Kilimall homepage
3. Scrapes Amazon for 5 different product categories
4. Applies 8% markup to all prices
5. Upserts all products to MongoDB

**Output:**
```
✅ Connected to MongoDB

=== JUMIA ===
🔍 Scraping Jumia from: https://www.jumia.co.ke/flash-sales/
✅ Scraped 15 products from Jumia

=== KILIMALL ===
🔍 Scraping Kilimall from: https://www.kilimall.com/
✅ Scraped 18 products from Kilimall

=== AMAZON ===
🔍 Scraping Amazon for: "ergonomic mouse"
✅ Scraped 12 products from Amazon
... more searches ...

=== SEED COMPLETE ===
✅ Total products scraped: 85
💾 Total products upserted: 82
📈 Markup applied: 8%
📊 Total products in DB: 120
```

---

## 🔧 How It Works

### Scraping Flow
1. **Initiate request** - Uses axios with browser User-Agent headers
2. **Load HTML** - Cheerio parses the marketplace HTML
3. **Extract data** - CSS selectors grab product info:
   - Name
   - Price
   - Image URL
   - Product link
4. **Apply markup** - Adds 8% to original price (configurable)
5. **Save to DB** - Uses MongoDB upsert (creates new or updates existing)

### Example: Jumia Scraper Logic
```javascript
// Grab all product articles
$('article.prd').each((i, el) => {
  // Extract product details
  const name = $(el).find('.name').text();
  const priceStr = $(el).find('.prc').text().replace('KSh ', '');
  const image = $(el).find('img.img').attr('data-src');
  const link = "https://www.jumia.co.ke" + $(el).find('a.core').attr('href');
  
  // Apply markup
  const price = parseFloat(priceStr);
  const salePrice = price * 1.08; // 8% markup
  
  // Save to DB
  await Product.upsert({...})
});
```

---

## 📝 Product Schema Stored

Each scraped product includes:
```javascript
{
  name: "Samsung 55\" TV",
  originalPrice: 45000,           // Marketplace price
  price: 48600,                   // Your store price (with markup)
  imageUrl: "https://...",
  sourceUrl: "https://www.jumia.co.ke/p/...",
  sourceName: "Jumia",
  supplierId: "jumia",
  description: "Samsung 55\" TV - Flash sale on Jumia Kenya",
  createdAt: "2024-03-18T...",
  updatedAt: "2024-03-18T:..."
}
```

---

## ⚙️ Customization

### Change Markup Percentage
Edit `scrapeJumiaFlashSales.js` or `scrape-and-seed.js`:
```javascript
const MARKUP_PERCENTAGE = 1.15; // 15% markup instead of 8%
```

### Change Jumia URL
```javascript
const JUMIA_URL = "https://www.jumia.co.ke/"; // Homepage
// or
const JUMIA_URL = "https://www.jumia.co.ke/smartphones/";  // Category
```

### Change Number of Products Scraped
In `scrape-and-seed.js`:
```javascript
// Scrape Jumia (change 20 to your limit)
const jumiaProducts = await scrapeJumia(url, 20);

// Or in jumia.js scraper:
if (products.length >= 50) return false; // Scrape max 50
```

### Add More Scrapers
1. Create new file: `src/scrapers/mynewsite.js`
2. Export async function: `export async function scrapeMyNewSite(url) { ... }`
3. Import in `scrape-and-seed.js`
4. Call it: `const results = await scrapeMyNewSite(url);`

---

## ⚠️ Important Notes

### Legal / Ethical
- ✅ Check each marketplace's **robots.txt** and **Terms of Service**
- ✅ Use reasonable delays between requests
- ✅ Don't hammer the servers with rapid requests
- ⚠️ Some sites prohibit scraping (Amazon)
  - For Amazon, prefer official APIs (Product Advertising API)
  - For production, consider using marketplace APIs instead

### Technical Considerations
- **HTML Structure Changes** - If a marketplace redesigns, selectors may break
- **Rate Limiting** - Sites may block repeated requests; use proxies if needed
- **JavaScript Rendering** - Some sites load products via JS (Temu); use Puppeteer/Playwright instead
- **Images** - Image URLs may expire; consider caching locally

---

## 🐛 Troubleshooting

### No products scraped
**Problem:** "⚠️  No products scraped. Jumia HTML structure may have changed."

**Solution:**
1. Check if the marketplace is up and accessible
2. Update CSS selectors in the scraper
3. Test manually: `curl https://www.jumia.co.ke/flash-sales/` and inspect HTML

### MongoDB connection fails
**Problem:** "❌ MONGO_URI not set in .env"

**Solution:**
```bash
# Copy and fill .env
cp server/.env.example server/.env

# Edit with your MongoDB connection string
# MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net
```

### Scraper times out
**Problem:** "❌ Timeout after 15000ms"

**Solution:**
- Check internet connection
- Try a different marketplace URL
- Increase timeout in scraper (change `timeout: 15000` to `timeout: 30000`)

### Duplicate products in database
**Problem:** Same product appearing multiple times

**Solution:**
The scrapers use `upsert`: if a product with the same `sourceName` and `sourceUrl` exists, it updates instead of creating a duplicate. To force clean start:

```javascript
// In scrape-and-seed.js, uncomment:
const deleted = await Product.deleteMany({ sourceName: { $in: ["Jumia", "Kilimall"] } });
console.log(`Deleted ${deleted.deletedCount} old products`);
```

---

## 📚 File Structure

```
dropshipping/
├── server/
│   ├── scrapeJumiaFlashSales.js    # Single marketplace scraper
│   ├── src/
│   │   └── scrapers/
│   │       ├── jumia.js
│   │       ├── kilimall.js
│   │       └── amazon.js
│   └── package.json               # npm scripts
│
└── scrape-and-seed.js             # Master multi-marketplace scraper
```

---

## 🚀 Production Tips

1. **Schedule scrapes** using cron or a task scheduler:
   ```bash
   # Every day at 2 AM
   0 2 * * * cd /path/to/dropshipping && npm --prefix server run scrape
   ```

2. **Monitor scrapes** - Log successful/failed runs
3. **Cache images locally** - Don't rely on marketplace image URLs
4. **Update prices regularly** - Re-run scraper daily/weekly to keep prices fresh
5. **Use marketplace APIs** when available (Amazon SP-API, Jumia API, etc.)

---

**Ready to scrape? Run: `npm run scrape:jumia`** 🚀
