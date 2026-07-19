"use client";

import { ShoppingBag } from "lucide-react";

import { useCart } from "@/components/storefront/cart-provider";
import { Button } from "@/components/ui/button";
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
  const { addItem } = useCart();
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
        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="font-mono text-base tabular-nums text-white">{formatPrice(product.sellingPrice)}</p>
          {isOutOfStock ? (
            <p className="text-sm font-medium text-white">Out of stock</p>
          ) : product.isLowStock ? (
            <span className="rounded-full border border-white/45 px-3 py-1 text-xs font-medium text-white">
              Low stock
            </span>
          ) : (
            <p className="text-sm text-zinc-300">Available tonight</p>
          )}
        </div>
        <Button
          type="button"
          className="mt-5 w-full bg-aloe-10 text-black hover:bg-pistachio-10"
          onClick={() => addItem(product)}
          disabled={isOutOfStock}
        >
          <ShoppingBag aria-hidden="true" />
          {isOutOfStock ? "Out of stock" : "Add to cart"}
        </Button>
      </div>
    </article>
  );
}
