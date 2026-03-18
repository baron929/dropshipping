import { useCart } from "../context/CartContext";

export default function ProductGrid({ products }) {
  const { addItem } = useCart();

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <article
          key={product._id}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-44 w-full rounded-2xl object-cover"
            loading="lazy"
          />
          <div className="mt-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{product.name}</h2>
                <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                  {product.description}
                </p>
              </div>
              <a
                href={product.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                Source ↗
              </a>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">
                  {product.sourceName} price:
                  <span className="ml-1 line-through">${product.originalPrice.toFixed(2)}</span>
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  ${product.price.toFixed(2)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => addItem(product)}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
