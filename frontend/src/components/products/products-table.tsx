"use client";

import { Archive, Edit3, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/products";

interface ProductsTableProps {
  products: Product[];
  isArchivedView: boolean;
  isPending: boolean;
  onEdit: (product: Product) => void;
  onArchive: (product: Product) => void;
  onRestore: (product: Product) => void;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function ProductsTable({
  products,
  isArchivedView,
  isPending,
  onEdit,
  onArchive,
  onRestore,
}: ProductsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full text-left text-sm">
          <caption className="sr-only">
            {isArchivedView ? "Archived products" : "Active products"}
          </caption>
          <thead className="border-b border-border bg-muted/60 text-xs uppercase tracking-[0.08em] text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Stock</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-border/80 last:border-0 hover:bg-muted/35"
              >
                <td className="px-5 py-4">
                  <div className="flex min-w-[220px] items-center gap-3">
                    <div className="size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                      {/* External product image URLs are user-managed and cannot use Next Image remote patterns. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    </div>
                    <span className="font-medium text-foreground">
                      {product.name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 text-muted-foreground">
                  {product.category}
                </td>
                <td className="px-5 py-4 font-mono tabular-nums">
                  {formatPrice(product.sellingPrice)}
                </td>
                <td className="px-5 py-4">
                  <span className="font-mono tabular-nums">{product.stock}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1">
                    {isArchivedView ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onRestore(product)}
                        disabled={isPending}
                      >
                        <RotateCcw aria-hidden="true" />
                        Restore
                      </Button>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(product)}
                          disabled={isPending}
                        >
                          <Edit3 aria-hidden="true" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-700 hover:bg-red-50 hover:text-red-800"
                          onClick={() => onArchive(product)}
                          disabled={isPending}
                        >
                          <Archive aria-hidden="true" />
                          Archive
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
