"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Boxes, X } from "lucide-react";

import { AdjustStockDialog } from "@/components/inventory/adjust-stock-dialog";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { Button } from "@/components/ui/button";
import { useInventory } from "@/hooks/use-inventory";
import type { InventoryProduct, StockOperation } from "@/lib/inventory";

interface ToastState {
  message: string;
  type: "success" | "error";
}

function LoadingTable() {
  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-card"
      aria-label="Loading inventory"
    >
      <div className="grid gap-4 p-5">
        {[0, 1, 2, 3].map((row) => (
          <div
            key={row}
            className="grid grid-cols-[1.5fr_0.8fr_0.7fr_0.5fr_0.8fr_1fr] items-center gap-5"
          >
            <div className="h-4 animate-pulse rounded bg-muted" />
            <div className="h-4 animate-pulse rounded bg-muted" />
            <div className="h-4 animate-pulse rounded bg-muted" />
            <div className="h-5 animate-pulse rounded bg-muted" />
            <div className="h-7 animate-pulse rounded-full bg-muted" />
            <div className="h-11 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function InventoryPage() {
  const [selectedProduct, setSelectedProduct] =
    useState<InventoryProduct | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    products,
    isLoading,
    isSubmitting,
    error,
    refresh,
    submitAdjustment,
  } = useInventory();

  useEffect(
    () => () => {
      if (toastTimeout.current) {
        clearTimeout(toastTimeout.current);
      }
    },
    [],
  );

  function showToast(message: string, type: ToastState["type"]) {
    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current);
    }

    setToast({ message, type });
    toastTimeout.current = setTimeout(() => setToast(null), 5000);
  }

  async function handleAdjustment(
    productId: string,
    operation: StockOperation,
    value: number,
  ) {
    const refreshError = await submitAdjustment(productId, operation, value);
    showToast(
      refreshError ?? "Stock updated.",
      refreshError ? "error" : "success",
    );
    setSelectedProduct(null);
  }

  return (
    <main className="min-h-[100dvh] bg-background px-4 py-6 text-foreground sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-pistachio-10 text-foreground">
              <Boxes aria-hidden="true" className="size-5" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Inventory
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review stock levels and make fast adjustments for tonight&apos;s
                shop.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-6" aria-labelledby="inventory-list-title">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 id="inventory-list-title" className="text-lg font-medium">
                Products
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sorted by product name from A to Z.
              </p>
            </div>
            {!isLoading && !error ? (
              <span className="text-sm text-muted-foreground">
                {products.length}{" "}
                {products.length === 1 ? "product" : "products"}
              </span>
            ) : null}
          </div>

          <div aria-live="polite">
            {isLoading ? <LoadingTable /> : null}

            {!isLoading && error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-900">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className="mt-0.5 size-5 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <h2 className="font-medium">
                      Inventory could not be loaded
                    </h2>
                    <p className="mt-1 text-sm leading-6">{error}</p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 border-red-300 bg-white text-red-900 hover:bg-red-100"
                      onClick={() => void refresh()}
                    >
                      Try again
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            {!isLoading && !error && products.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/35 px-6 py-14 text-center">
                <h2 className="text-lg font-medium">No products to manage</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Products will appear here once they have been added to the
                  store.
                </p>
              </div>
            ) : null}

            {!isLoading && !error && products.length > 0 ? (
              <InventoryTable
                products={products}
                isPending={isSubmitting}
                onAdjust={setSelectedProduct}
              />
            ) : null}
          </div>
        </section>
      </div>

      <AdjustStockDialog
        key={selectedProduct?.id ?? "no-product"}
        product={selectedProduct}
        isSubmitting={isSubmitting}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProduct(null);
          }
        }}
        onSubmit={handleAdjustment}
        onError={(message) => showToast(message, "error")}
      />

      {toast ? (
        <div
          className={
            toast.type === "success"
              ? "fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-950 shadow-lg"
              : "fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-900 shadow-lg"
          }
          role={toast.type === "error" ? "alert" : "status"}
        >
          <p className="text-sm leading-6">{toast.message}</p>
          <button
            type="button"
            className="rounded-md p-1 focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label="Dismiss notification"
            onClick={() => setToast(null)}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </main>
  );
}
