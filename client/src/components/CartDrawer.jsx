import { useMemo } from "react";
import { X } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function CartDrawer({ onCheckout }) {
  const { cartItems, removeItem, clearCart } = useCart();

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  const hasItems = cartItems.length > 0;

  return (
    <aside className="fixed bottom-6 right-6 z-40 w-[340px] max-w-[calc(100%-2rem)]">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button
            type="button"
            onClick={clearCart}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Clear
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto px-5 py-4">
          {hasItems ? (
            cartItems.map((item) => (
              <div key={item.productId} className="flex items-start gap-3 py-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                  <p className="mt-1 text-sm text-slate-700">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Remove item"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Your cart is currently empty.</p>
          )}
        </div>

        <div className="border-t border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Subtotal</span>
            <span className="text-lg font-semibold text-slate-900">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <button
            type="button"
            disabled={!hasItems}
            onClick={onCheckout}
            className="mt-4 w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Checkout
          </button>
        </div>
      </div>
    </aside>
  );
}
