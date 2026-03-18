# M-Pesa STK Push Integration Setup Guide

This guide walks you through setting up M-Pesa STK Push payments for your dropshipping store targeting Kenya.

---

## 📋 Quick Overview

**What's been implemented:**
1. ✅ M-Pesa STK Push initiator (`/api/mpesa/stk`)
2. ✅ M-Pesa callback handler (`/api/mpesa/callback`) that parses `MpesaReceiptNumber`
3. ✅ Automatic order status update (Pending → Paid)
4. ✅ Supplier fulfillment (`fulfillJumiaOrder()` and `fulfillKilimallOrder()`)
5. ✅ React component with "Waiting for PIN..." state and polling

---

## 🔧 Step 1: Get M-Pesa API Credentials

### Option A: Sandbox (Testing) - Recommended First
1. Go to **https://developer.safaricom.co.ke**
2. Click **"Create an App"**
3. Fill in app name (e.g., "MyDropshop")
4. Select **"Mpesa"** as the product
5. Accept terms and create
6. You'll get:
   - **Consumer Key**
   - **Consumer Secret**
   - **Short Code** (e.g., 174379)
   - **Pass Key** (provided in the dashboard)

### Option B: Production - After Testing
Contact Safaricom support for production credentials and a real short code.

---

## 🔑 Step 2: Set Up Environment Variables

1. Copy `server/.env.example` → `server/.env`
2. Fill in M-Pesa credentials:

```env
# M-Pesa (Sandbox)
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_SHORT_CODE=174379
MPESA_PASS_KEY=your_pass_key_here
MPESA_CALLBACK_URL=http://localhost:5000/api/mpesa/callback

# Jumia & Kilimall (Optional for now)
JUMIA_API_KEY=your_jumia_api_key_here
KILIMALL_API_KEY=your_kilimall_api_key_here
```

---

## 🧪 Step 3: Test with Your Phone Number

### Test Flow

1. **Start the backend:**
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **Start the frontend:**
   ```bash
   cd ../client
   npm run dev
   ```

3. **Place an Order:**
   - Open http://localhost:5173
   - Add products to cart
   - Click "Checkout" button
   - Fill in shipping address
   - Click "Place Order"

4. **Enter Your Phone Number:**
   - Format: `254712345678` (without +)
   - This is where the STK push will appear

5. **Watch for the M-Pesa Prompt:**
   - On your phone, an M-Pesa STK popup should appear
   - Enter your 4-digit PIN
   - Payment is deducted from your account

6. **React Component Polls for Status:**
   - Frontend continuously checks `/api/mpesa/status/:orderId`
   - When status changes to `"paid"`, it shows ✓ Payment Confirmed
   - Supplier fulfillment happens automatically

---

## 📦 Step 4: Add Supplier API Keys (Optional)

Once M-Pesa is working, add your supplier credentials:

```env
# Jumia Vendor Center
JUMIA_API_KEY=your_api_key
JUMIA_VENDOR_ID=your_vendor_id

# Kilimall OpenAPI
KILIMALL_API_KEY=your_api_key
KILIMALL_SELLER_ID=your_seller_id
```

When a payment succeeds:
1. M-Pesa callback is received
2. Order marked as "Paid"
3. `fulfillJumiaOrder()` sends order to Jumia
4. `fulfillKilimallOrder()` sends order to Kilimall
5. Supplier responses stored in `order.supplierResponses`

---

## 🔄 API Endpoints

### 1. POST /api/mpesa/stk
**Initiate STK Push**

```javascript
// Request
{
  "phoneNumber": "254712345678",
  "amount": 500,
  "orderId": "order_id_from_db"
}

// Response
{
  "success": true,
  "checkoutRequestID": "...",
  "requestId": "..."
}
```

### 2. POST /api/mpesa/callback
**M-Pesa sends callback here (automatic)**

M-Pesa Daraja calls this endpoint automatically with:
```javascript
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "order_id",
      "CheckoutRequestID": "...",
      "ResultCode": 0, // 0 = success, non-zero = failed
      "ResultDesc": "The service request has been processed successfully.",
      "CallbackMetadata": {
        "Item": [
          { "Name": "Amount", "Value": 500 },
          { "Name": "MpesaReceiptNumber", "Value": "NHY6KJ3VU2" },
          { "Name": "TransactionDate", "Value": "20231201120000" },
          { "Name": "PhoneNumber", "Value": 254712345678 }
        ]
      }
    }
  }
}
```

### 3. GET /api/mpesa/status/:orderId
**Check order payment status**

```javascript
// Response
{
  "orderId": "order_id",
  "paymentStatus": "paid", // or "pending", "failed"
  "fulfillmentStatus": "processing", // or "pending", "fulfilled"
  "mpesaReceiptNumber": "NHY6KJ3VU2",
  "supplierResponses": [
    {
      "supplier": "Jumia",
      "success": true,
      "message": "Order sent to Jumia for fulfillment"
    }
  ]
}
```

---

## 🛠️ How It Works (Deep Dive)

### Frontend Flow
1. Customer enters shipping details
2. Clicks "Place Order" → creates order in DB (status: `pending`)
3. Shown phone number input
4. Clicks "Send M-Pesa Prompt"
5. Backend calls M-Pesa `/stkpush/v1/processrequest`
6. STK prompt appears on customer's phone
7. Component **polls** `/api/mpesa/status/:orderId` every 2 seconds
8. When status changes to `paid` → shows ✓ Confirmation

### Backend Flow
1. `/api/mpesa/stk` endpoint initiates STK Push
2. Customer enters PIN on their phone
3. M-Pesa calls `/api/mpesa/callback` (webhook)
4. Backend parses callback metadata
5. Updates order: `paymentStatus = "paid"`
6. Calls `fulfillJumiaOrder()` and `fulfillKilimallOrder()`
7. Stores responses in `order.supplierResponses`

---

## ⚙️ Code Structure

### Backend Files Created

- `server/src/utils/mpesa.js`
  - `getMpesaToken()` - Get OAuth token
  - `initiateSTKPush()` - Send STK to customer
  - `parseCallback()` - Extract MpesaReceiptNumber from callback

- `server/src/routes/mpesa.js`
  - `POST /api/mpesa/stk` - Initiate payment
  - `POST /api/mpesa/callback` - Handle M-Pesa webhook
  - `GET /api/mpesa/status/:orderId` - Check payment status

- `server/src/utils/suppliers.js`
  - `fulfillJumiaOrder(order)` - Send to Jumia
  - `fulfillKilimallOrder(order)` - Send to Kilimall

### Frontend Files Created

- `client/src/components/MpesaPayment.jsx`
  - Phone number input
  - "Waiting for PIN..." loading state
  - Polls for payment confirmation
  - Shows supplier fulfillment status

---

## ✅ Testing Checklist

- [ ] Get M-Pesa credentials from Safaricom Daraja
- [ ] Fill in `.env` with credentials
- [ ] Run `npm install` in both client & server
- [ ] Run backend: `npm run dev`
- [ ] Run frontend: `npm run dev`
- [ ] Place test order with your phone number
- [ ] Confirm STK prompt appears
- [ ] Enter M-Pesa PIN
- [ ] Check that frontend shows ✓ Confirmation
- [ ] Verify order status in MongoDB changed to `"paid"`

---

## 🐛 Troubleshooting

### STK Not Appearing
- ✓ Ensure phone number format: `254...` (no +)
- ✓ Ensure phone is registered with M-Pesa
- ✓ Check `MPESA_CALLBACK_URL` is correct
- ✓ Check consumer key/secret in `.env`

### Callback Not Firing
- ✓ M-Pesa needs a public URL (localhost won't work)
- ✓ Use ngrok: `ngrok http 5000` to expose locally
- ✓ Update `MPESA_CALLBACK_URL` to ngrok URL

### Payment Status Still "Pending"
- ✓ Check MongoDB order document
- ✓ Check backend logs for callback errors
- ✓ Ensure callback route is enabled

---

## 🚀 Production Checklist

1. Get **production M-Pesa credentials** from Safaricom
2. Update `.env` with production short code & pass key
3. Change `MPESA_CALLBACK_URL` to your production domain
4. Enable HTTPS on your server (M-Pesa requires HTTPS)
5. Test with real M-Pesa account
6. Monitor `/api/mpesa/callback` for errors
7. Set up supplier API keys (Jumia, Kilimall, etc.)
8. Test end-to-end fulfillment

---

## 📞 Support Resources

- M-Pesa Daraja API Docs: https://developer.safaricom.co.ke/
- STK Push Guide: https://developer.safaricom.co.ke/docs
- Jumia Vendor API: https://docs.jumia.com/
- Kilimall OpenAPI: https://openapi.kilimall.com/docs

---

**You're all set! Test with your phone number and let me know if you hit any issues.** 🎉
