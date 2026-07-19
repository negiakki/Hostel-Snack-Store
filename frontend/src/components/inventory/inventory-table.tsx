"use client";

import { Circle, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { InventoryProduct } from "@/lib/inventory";

interface InventoryTableProps {
  products: InventoryProduct[];
  isPending: boolean;
  onAdjust: (product: InventoryProduct) => void;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function StockStatus({ product }: { product: InventoryProduct }) {
  const status = product.isOutOfStock
    ? {
        label: "Out of stock",
        className: "border-red-200 bg-red-50 text-red-800",
        dotClassName: "fill-red-600 text-red-600",
      }
    : product.isLowStock
      ? {
          label: "Low stock",
          className: "border-amber-200 bg-amber-50 text-amber-900",
          dotClassName: "fill-amber-500 text-amber-500",
        }
      : {
          label: "In stock",
          className: "border-emerald-200 bg-emerald-50 text-emerald-900",
          dotClassName: "fill-emerald-600 text-emerald-600",
        };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}
    >
      <Circle className={`size-2 ${status.dotClassName}`} aria-hidden="true" />
      {status.label}
    </span>
  );
}

export function InventoryTable({
  products,
  isPending,
  onAdjust,
}: InventoryTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="min-w-[820px] w-full text-left text-sm">
          <caption className="sr-only">Inventory products</caption>
          <thead className="border-b border-border bg-muted/60 text-xs uppercase tracking-[0.08em] text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Selling price</th>
              <th className="px-5 py-3 font-medium">Current stock</th>
              <th className="px-5 py-3 font-medium">Stock status</th>
              <th className="px-5 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-border/80 last:border-0 hover:bg-muted/35"
              >
                <td className="px-5 py-4 font-medium text-foreground">
                  {product.name}
                </td>
                <td className="px-5 py-4 text-muted-foreground">
                  {product.category}
                </td>
                <td className="px-5 py-4 font-mono tabular-nums">
                  {formatPrice(product.sellingPrice)}
                </td>
                <td className="px-5 py-4 font-mono text-base tabular-nums">
                  {product.stock}
                </td>
                <td className="px-5 py-4">
                  <StockStatus product={product} />
                </td>
                <td className="px-5 py-4 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => onAdjust(product)}
                  >
                    <SlidersHorizontal aria-hidden="true" />
                    Adjust stock
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
