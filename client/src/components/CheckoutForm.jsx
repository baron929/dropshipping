import { useState } from "react";
import { useCart } from "../context/CartContext";
import MpesaPayment from "./MpesaPayment";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export default function CheckoutForm({ onClose }) {
  const { cartItems, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [step, setStep] = useState("checkout"); // "checkout" | "payment" | "success"

  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleChange = (key) => (event) => {
    setFormState((prev) => ({ ...prev, [key]: event.target.value }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerDetails: formState,
          cartItems,
          totalPrice: subtotal,
        }),
      });

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.message || "Checkout failed");
      }

      const { orderId: createdOrderId } = await res.json();
      setOrderId(createdOrderId);
      setStep("payment");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handlePaymentSuccess(paymentData) {
    setSuccess(true);
    setStep("success");
    clearCart();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-semibold">Checkout</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            Close
          </button>
        </div>

        <div className="px-6 py-5">
          {step === "success" ? (
            <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-emerald-900">
              <p className="font-semibold">✓ Payment & Order Complete!</p>
              <p className="mt-1 text-sm">
                Your order has been confirmed and sent to suppliers for fulfillment. You'll
                receive updates via email.
              </p>
            </div>
          ) : step === "payment" && orderId ? (
            <>
              <p className="text-sm text-slate-600">
                Complete payment with M-Pesa to fulfill your order.
              </p>
              <div className="mt-6">
                <MpesaPayment
                  orderId={orderId}
                  amount={subtotal}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                Fill out your details and then submit your order. You'll proceed to M-Pesa
                payment.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Full name</span>
                  <input
                    value={formState.fullName}
                    onChange={handleChange("fullName")}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="Jane Doe"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <input
                    type="email"
                    value={formState.email}
                    onChange={handleChange("email")}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="you@example.com"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Phone</span>
                  <input
                    value={formState.phone}
                    onChange={handleChange("phone")}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="(123) 456-7890"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Country</span>
                  <input
                    value={formState.country}
                    onChange={handleChange("country")}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="United States"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Address line 1</span>
                <input
                  value={formState.addressLine1}
                  onChange={handleChange("addressLine1")}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="123 Main St"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Address line 2</span>
                <input
                  value={formState.addressLine2}
                  onChange={handleChange("addressLine2")}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="Apt, suite, etc. (optional)"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">City</span>
                  <input
                    value={formState.city}
                    onChange={handleChange("city")}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="San Francisco"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">State</span>
                  <input
                    value={formState.state}
                    onChange={handleChange("state")}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="CA"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Postal code</span>
                <input
                  value={formState.postalCode}
                  onChange={handleChange("postalCode")}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="94103"
                />
              </label>

              {error ? (
                <p className="text-sm text-rose-600">{error}</p>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-600">
                  Total: <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Placing order..." : "Place order"}
                </button>
              </div>
            </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
