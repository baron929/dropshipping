import { useEffect, useState } from "react";
import { Loader, CheckCircle, AlertCircle } from "lucide-react";

/**
 * MpesaPayment Component
 *
 * Allows customer to enter phone number and pay via M-Pesa STK Push.
 * Shows loading state while waiting for M-Pesa PIN entry, then polls
 * the database to confirm payment status.
 *
 * Props:
 * - orderId: string (the order ID to pay for)
 * - amount: number (the total to pay)
 * - onPaymentSuccess: function (callback when payment confirmed)
 */
export default function MpesaPayment({ orderId, amount, onPaymentSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [polling, setPolling] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);
  const [pollCount, setPollCount] = useState(0);

  /**
   * Initiate STK Push
   */
  async function handleInitiateSTK(e) {
    e.preventDefault();

    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number (e.g., 254712345678)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/mpesa/stk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          amount,
          orderId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to initiate STK Push");
      }

      setPaymentInitiated(true);
      setPolling(true);
      setPollCount(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Poll order status every 2 seconds for up to 2 minutes
   */
  useEffect(() => {
    if (!polling) return;

    const interval = setInterval(async () => {
      setPollCount((prev) => {
        if (prev >= 60) {
          // Stop polling after 2 minutes (60 × 2 seconds)
          setPolling(false);
          setError("Payment request timed out. Please try again.");
          return prev;
        }
        return prev + 1;
      });

      try {
        const response = await fetch(`/api/mpesa/status/${orderId}`);
        const data = await response.json();

        setPaymentStatus(data);

        // Check if payment succeeded
        if (data.paymentStatus === "paid") {
          setPolling(false);
          if (onPaymentSuccess) {
            onPaymentSuccess(data);
          }
        } else if (data.paymentStatus === "failed") {
          setPolling(false);
          setError("Payment was declined. Please try again.");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [polling, orderId, onPaymentSuccess]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">M-Pesa Payment</h3>
      <p className="mt-2 text-sm text-slate-600">
        Total to pay: <span className="font-semibold">${amount.toFixed(2)}</span>
      </p>

      {/* Phone Number Input Form */}
      {!paymentInitiated ? (
        <form onSubmit={handleInitiateSTK} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Phone Number</span>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="254712345678"
              disabled={loading}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-slate-500">
              Format: country code + phone (e.g., 254712345678)
            </p>
          </label>

          {error && (
            <div className="flex gap-2 rounded-lg bg-rose-50 p-3 text-rose-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Initiating..." : "Send M-Pesa Prompt"}
          </button>
        </form>
      ) : null}

      {/* Waiting for PIN State */}
      {paymentInitiated && polling && (
        <div className="mt-6 text-center">
          <div className="flex justify-center">
            <Loader className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-900">Waiting for PIN...</p>
          <p className="mt-2 text-xs text-slate-600">
            An M-Pesa prompt should appear on your phone. Enter your PIN to complete payment.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Poll count: {pollCount}/60 (~{(pollCount * 2) / 60} min)
          </p>
        </div>
      )}

      {/* Payment Confirmed State */}
      {paymentStatus?.paymentStatus === "paid" && (
        <div className="mt-6 rounded-lg bg-emerald-50 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-900">Payment Confirmed!</p>
              <p className="mt-1 text-sm text-emerald-800">
                Receipt: {paymentStatus.mpesaReceiptNumber}
              </p>
            </div>
          </div>

          {paymentStatus.supplierResponses && paymentStatus.supplierResponses.length > 0 && (
            <div className="mt-4 border-t border-emerald-200 pt-4">
              <p className="text-xs font-semibold text-emerald-900">Supplier Status:</p>
              {paymentStatus.supplierResponses.map((resp, idx) => (
                <p key={idx} className="mt-1 text-xs text-emerald-800">
                  {resp.supplier}: {resp.success ? "✓ Sent to supplier" : "✗ " + resp.message}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Failed State */}
      {paymentStatus?.paymentStatus === "failed" && (
        <div className="mt-6 rounded-lg bg-rose-50 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-rose-600" />
            <p className="font-semibold text-rose-900">Payment Failed</p>
          </div>
          <p className="mt-2 text-sm text-rose-800">
            Your payment could not be processed. Please try again.
          </p>
        </div>
      )}
    </div>
  );
}
