import axios from "axios";

const BASE_URL = "https://sandbox.safaricom.co.ke";

/**
 * Generate M-Pesa OAuth token
 * Used for all subsequent M-Pesa API calls
 */
export async function getMpesaToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error("MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET are not set");
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const response = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  return response.data.access_token;
}

/**
 * Initiate M-Pesa STK Push
 * Sends an STK prompt to customer's phone; they enter PIN to pay
 */
export async function initiateSTKPush({ phoneNumber, amount, orderId }) {
  const token = await getMpesaToken();

  const timestamp = new Date().toISOString().replace(/[:-]/g, "").split(".")[0];
  const businessShortCode = process.env.MPESA_SHORT_CODE;
  const passKey = process.env.MPESA_PASS_KEY;

  if (!businessShortCode || !passKey) {
    throw new Error("MPESA_SHORT_CODE and MPESA_PASS_KEY are not set");
  }

  const password = Buffer.from(`${businessShortCode}${passKey}${timestamp}`).toString("base64");

  const response = await axios.post(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    BusinessShortCode: businessShortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.ceil(amount),
    PartyA: phoneNumber,
    PartyB: businessShortCode,
    PhoneNumber: phoneNumber,
    CallBackURL: process.env.MPESA_CALLBACK_URL || "http://localhost:5000/api/mpesa/callback",
    AccountReference: orderId,
    TransactionDesc: `Order ${orderId}`,
  });

  return response.data;
}

/**
 * Parse M-Pesa callback response
 * Extracts MpesaReceiptNumber and payment status from CallbackMetadata
 */
export function parseCallback(body) {
  const result = {
    success: false,
    resultCode: null,
    resultDesc: null,
    mpesaReceiptNumber: null,
    transactionDate: null,
    phoneNumber: null,
    amount: null,
  };

  if (!body.Body?.stkCallback) {
    return result;
  }

  const stkCallback = body.Body.stkCallback;
  result.resultCode = stkCallback.ResultCode;
  result.resultDesc = stkCallback.ResultDesc;

  // Success if ResultCode is 0
  if (stkCallback.ResultCode === 0) {
    result.success = true;

    // Extract metadata from CallbackMetadata array
    const metadata = stkCallback.CallbackMetadata?.Item || [];
    for (const item of metadata) {
      switch (item.Name) {
        case "MpesaReceiptNumber":
          result.mpesaReceiptNumber = item.Value;
          break;
        case "TransactionDate":
          result.transactionDate = item.Value;
          break;
        case "PhoneNumber":
          result.phoneNumber = item.Value;
          break;
        case "Amount":
          result.amount = item.Value;
          break;
      }
    }
  }

  return result;
}
