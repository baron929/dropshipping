import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Navbar({ onCheckout }) {
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Dropship Studio</h1>
          <p className="text-sm text-slate-500">A modern middleman store demo</p>
        </div>

        <button
          type="button"
          onClick={onCheckout}
          className="relative inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          <ShoppingCart className="h-5 w-5" />
          Cart
          {cartCount > 0 ? (
            <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-white">
              {cartCount}
            </span>
          ) : null}
        </button>
      </div>
    </header>
  );
}
