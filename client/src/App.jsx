import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import ProductGrid from "./components/ProductGrid";
import CartDrawer from "./components/CartDrawer";
import CheckoutForm from "./components/CheckoutForm";

export default function App() {
  const [products, setProducts] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar onCheckout={() => setIsCheckoutOpen(true)} />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-semibold mb-6">Shop Our Picks</h1>
        <ProductGrid products={products} />
      </main>

      <CartDrawer onCheckout={() => setIsCheckoutOpen(true)} />

      {isCheckoutOpen && (
        <CheckoutForm onClose={() => setIsCheckoutOpen(false)} />
      )}
    </div>
  );
}
