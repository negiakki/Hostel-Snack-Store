import type { Product } from "@/lib/products";

interface CustomerProductCardProps {
  product: Product;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function CustomerProductCard({ product }: CustomerProductCardProps) {
  const isOutOfStock = product.stock === 0;

  return (
    <article className="overflow-hidden rounded-xl border border-white/15 bg-canvas-night-elevated">
      <div className="aspect-[4/3] overflow-hidden bg-surface-elevated-dark">
        {/* External product image URLs are user-managed and cannot use Next Image remote patterns. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="size-full object-cover"
        />
      </div>
      <div className="p-4 sm:p-5">
        <p className="text-sm text-zinc-400">{product.category}</p>
        <h2 className="mt-2 text-lg font-medium leading-6 text-white">
          {product.name}
        </h2>
        <div className="mt-5 flex items-end justify-between gap-4">
          <p className="font-mono text-base tabular-nums text-white">
            {formatPrice(product.sellingPrice)}
          </p>
          <p
            className={
              isOutOfStock
                ? "text-sm font-medium text-white"
                : "text-sm text-zinc-300"
            }
          >
            {isOutOfStock ? "Out of stock" : "Available tonight"}
          </p>
        </div>
      </div>
    </article>
  );
}
