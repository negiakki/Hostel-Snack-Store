"use client";

import { AlertCircle, ClipboardList } from "lucide-react";

import { OrdersTable } from "@/components/orders/orders-table";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/hooks/use-orders";

function LoadingOrders() {
  return (
    <div
      className="overflow-hidden rounded-xl border border-white/15 bg-canvas-night-elevated p-5"
      aria-label="Loading orders"
    >
      <div className="grid gap-4">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="h-11 animate-pulse rounded bg-white/10" />
        ))}
      </div>
    </div>
  );
}

export function OrdersPage() {
  const { orders, isLoading, isRefreshing, error, refresh } = useOrders();

  return (
    <main className="min-h-[100dvh] bg-canvas-night px-4 py-6 text-white sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="border-b border-white/15 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full border border-white/20 text-white">
              <ClipboardList aria-hidden="true" className="size-5" />
            </div>
            <div>
              <h1 className="text-3xl font-light tracking-tight">Orders</h1>
              <p className="mt-1 text-sm text-zinc-300">
                Review incoming orders and keep tonight&apos;s handovers moving.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-6" aria-labelledby="orders-list-title">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 id="orders-list-title" className="text-lg font-medium">
                Latest orders
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                New orders refresh automatically every 20 seconds.
              </p>
            </div>
            {!isLoading && !error ? (
              <span className="text-sm text-zinc-400">
                {orders.length} {orders.length === 1 ? "order" : "orders"}
              </span>
            ) : null}
          </div>

          <div aria-live="polite">
            {isLoading ? <LoadingOrders /> : null}
            {!isLoading && error ? (
              <div
                className="rounded-xl border border-rose-200/50 bg-rose-200/10 p-5 text-rose-50"
                role="alert"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0"
                  />
                  <div>
                    <h2 className="font-medium">Orders could not be loaded</h2>
                    <p className="mt-1 text-sm leading-6">{error}</p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 border-rose-100/60 bg-transparent text-rose-50 hover:bg-rose-100/15 hover:text-rose-50"
                      onClick={() => void refresh()}
                      disabled={isRefreshing}
                    >
                      {isRefreshing ? "Retrying" : "Try again"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
            {!isLoading && !error && orders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/20 bg-canvas-night-elevated px-6 py-14 text-center">
                <h2 className="text-lg font-medium">No orders yet.</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">
                  New customer orders will appear here automatically.
                </p>
              </div>
            ) : null}
            {!isLoading && !error && orders.length > 0 ? (
              <OrdersTable orders={orders} />
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
