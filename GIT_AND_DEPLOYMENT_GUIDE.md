# Git & Deployment Guide

## Phase 1: Initialize Git Repository Locally

### Step 1: Navigate to project root
```bash
cd dropshipping
```

### Step 2: Initialize Git
```bash
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Step 3: Add all files to staging
```bash
git add .
```

### Step 4: Create initial commit
```bash
git commit -m "Initial dropshipping boilerplate with M-Pesa, scraping, suppliers, and full middleware stack"
```

### Step 5: Verify commit
```bash
git log --oneline
git status
```

---

## Phase 2: Create GitHub Repository (if not done)

### Step 1: Go to https://github.com/new

### Step 2: Fill in details
- **Repository name**: `dropshipping-mern` (or your choice)
- **Description**: "Production-ready dropshipping platform with M-Pesa, multi-supplier integration, and real-time scraping"
- **Public/Private**: Choose based on preference
- **Do NOT initialize with README** (you already have commits)

### Step 3: Copy repository URL (HTTPS or SSH)
```
https://github.com/YOUR_USERNAME/dropshipping-mern.git
```

---

## Phase 3: Push to GitHub

### Step 1: Add remote
```bash
git remote add origin https://github.com/YOUR_USERNAME/dropshipping-mern.git
```

### Step 2: Rename branch (if needed)
```bash
git branch -M main
```

### Step 3: Push to GitHub
```bash
git push -u origin main
```

### Step 4: Verify
```bash
git remote -v
```

---

## Phase 4: Configure Credentials Before Running

### Create `.env` file (copy from `.env.example`)
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env 2>/dev/null || echo "No client .env.example"
```

### Edit `server/.env` with real values:
```env
# CRITICAL (required to run)
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGO_DB_NAME=dropshipping
PORT=5000
NODE_ENV=development

# M-PESA (optional for local dev, required for payment processing)
MPESA_CONSUMER_KEY=your_consumer_key_from_daraja
MPESA_CONSUMER_SECRET=your_consumer_secret_from_daraja
MPESA_SHORT_CODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback

# SUPPLIER APIs (optional)
JUMIA_API_KEY=your_jumia_api_key
KILIMALL_API_KEY=your_kilimall_api_key
AMAZON_API_KEY=your_amazon_api_key

# EMAIL SERVICE (optional, required for notifications)
EMAIL_SERVICE=gmail  # or 'sendgrid'
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
SENDGRID_API_KEY=your_sendgrid_key

# ADMIN CREDENTIALS
ADMIN_EMAIL=admin@dropshipping.local
ADMIN_PASSWORD=your_secure_password
```

### **Where to get credentials:**

#### MongoDB URI (CRITICAL)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Get connection string → Replace `<password>` and database name

#### M-Pesa (Optional for dev, required for payments)
1. Go to https://developer.safaricom.co.ke/
2. Register for Daraja API
3. Get Consumer Key and Secret
4. Copy Short Code (174379 is test code)
5. Generate PassKey in Safaricom portal

#### Email (Optional)
1. **Gmail**: Generate app password (2FA required)
2. **SendGrid**: Create free account, get API key

---

## Phase 5: Install Dependencies

### Backend
```bash
cd server
npm install
cd ..
```

### Frontend
```bash
cd client
npm install
cd ..
```

---

## Phase 6: Verify Setup

### Run preflight checks
```bash
cd server
node preflightCheck.js
```

You should see:
```
✅ critical checks passed (MONGO_URI set, node_modules installed)
⚠️ optional checks failed (M-Pesa/email config – these are optional for local dev)
```

### Start backend
```bash
cd server
npm run dev
```

Expected output:
```
Server running on port 5000
Connected to MongoDB: dropshipping
```

### Start frontend (new terminal)
```bash
cd client
npm run dev
```

Expected output:
```
VITE v4.x.x ready in xxx ms
Local: http://localhost:5173/
```

---

## Phase 7: Test Functionality

### Test products endpoint
```bash
curl http://localhost:5000/api/products
```

### Seed sample products
```bash
cd server
npm run seed
```

### Scrape real products (optional, time-intensive)
```bash
npm run scrape:jumia
```

### Check application
- Open http://localhost:5173
- You should see product grid
- Add items to cart
- (Payment requires M-Pesa credentials)

---

## Phase 8: Deployment Options

### Option A: Docker (Recommended)
```bash
# Build and run with Docker Compose
docker-compose up --build

# Access: http://localhost (frontend), http://localhost:5000/api (backend)
```

### Option B: Traditional VPS (DigitalOcean, Linode, AWS EC2)
```bash
# SSH into server, clone repo
git clone https://github.com/YOUR_USERNAME/dropshipping-mern.git
cd dropshipping-mern

# Install Node.js
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
source ~/.bashrc
nvm install 18

# Install dependencies
cd server && npm install && cd ../client && npm install && cd ..

# Build frontend
cd client && npm run build && cd ..

# Use PM2 for background process
npm install -g pm2
pm2 start server/src/index.js --name "dropshipping-api"
pm2 save
pm2 startup

# Use Nginx as reverse proxy (copy nginx.conf to /etc/nginx/sites-available/)
sudo cp nginx.conf /etc/nginx/sites-available/dropshipping
sudo ln -s /etc/nginx/sites-available/dropshipping /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option C: Vercel + Render (Easiest for beginners)
1. **Frontend**: Deploy `/client/dist` to Vercel
2. **Backend**: Deploy `server/` to Render.com (with MongoDB Atlas)

---

## Phase 9: Production Checklist

- [ ] `.env` configured with real credentials
- [ ] MongoDB Atlas cluster created and connected
- [ ] M-Pesa sandbox credentials obtained (if using payments)
- [ ] Email service configured (Gmail or SendGrid)
- [ ] API health check passing: `curl /api/health`
- [ ] Products loading in frontend
- [ ] Cart functionality working
- [ ] Rate limiting active (200 req/min per IP)
- [ ] Error handling working (test with invalid inputs)
- [ ] Security headers present (check with browser DevTools → Network)
- [ ] CORS configured properly
- [ ] Database backups scheduled
- [ ] Error logging monitored
- [ ] SSL certificate installed (if hosting)

---

## Phase 10: Continuous Development

### Pull latest changes
```bash
git pull origin main
```

### Create feature branch
```bash
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
# Open Pull Request on GitHub
```

### Update npm packages
```bash
npm audit
npm audit fix
```

---

## Quick Reference Commands

```bash
# Git
git status                          # Check status
git log --oneline -5                # Last 5 commits
git diff                            # Unstaged changes
git add .                           # Stage all
git commit -m "message"             # Commit
git push origin main                # Push to GitHub
git pull origin main                # Pull from GitHub

# Development
npm install                         # Install deps
npm run dev                         # Start dev server
npm run build                       # Build for production
npm run seed                        # Load sample data
npm run scrape:jumia                # Scrape Jumia

# Docker
docker-compose up --build           # Start services
docker-compose down                 # Stop services
docker logs container-name          # View logs
docker-compose ps                   # Show running containers

# Testing
curl http://localhost:5000/api/health        # Health check
curl http://localhost:5000/api/products      # Get products
```

---

## Troubleshooting

### "Cannot find module 'mongodb'"
```bash
cd server && npm install && cd ..
```

### "ECONNREFUSED 127.0.0.1:27017" (MongoDB not running in Docker)
```bash
docker-compose up -d mongodb
```

### "Port 5000 already in use"
```bash
lsof -i :5000  # Find process
kill -9 <PID>  # Kill process
# Or change PORT in .env
```

### "Git remote add failed"
```bash
git remote remove origin
git remote add origin <correct-url>
```

### "Cannot read property 'Item' of undefined" (M-Pesa callback)
- Ensure `CallbackMetadata` exists in M-Pesa response
- Check Daraja sandbox credentials
- Verify callback URL is reachable

---

## Support & Next Steps

1. **Monitor errors**: Check console output and MongoDB logs
2. **Test endpoints**: Use Postman or curl
3. **Review logs**: `docker-compose logs backend`
4. **Update credentials**: Edit `.env` anytime
5. **Scale suppliers**: Add more scrapers in `server/src/scrapers/`
6. **Customize markup**: Edit percentage in `scrape-and-seed.js` line 8

---

**You're all set!** 🚀 Your dropshipping platform is production-ready with M-Pesa, real-time scraping, and full middleware stack.
