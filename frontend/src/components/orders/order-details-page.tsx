"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, Check, ClipboardList } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAdminOrder, updateAdminOrderStatus } from "@/lib/admin-orders";
import type { AdminOrderDetail, OrderStatus } from "@/lib/admin-orders";

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatOrderTime(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function nextStatus(status: OrderStatus): OrderStatus | null {
  if (status === "Placed") return "Ready";
  if (status === "Ready") return "Completed";
  return null;
}

function LoadingOrderDetails() {
  return (
    <div className="grid gap-6" aria-label="Loading order details">
      <div className="h-20 animate-pulse rounded-xl bg-white/10" />
      <div className="h-52 animate-pulse rounded-xl bg-white/10" />
      <div className="h-44 animate-pulse rounded-xl bg-white/10" />
    </div>
  );
}

export function OrderDetailsPage({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      setOrder(await getAdminOrder(orderId));
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Order details could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    let isCurrent = true;

    async function loadInitialOrder() {
      try {
        const loadedOrder = await getAdminOrder(orderId);

        if (!isCurrent) {
          return;
        }

        setOrder(loadedOrder);
        setError(null);
      } catch (requestError) {
        if (!isCurrent) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Order details could not be loaded.",
        );
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialOrder();

    return () => {
      isCurrent = false;
    };
  }, [orderId]);

  const targetStatus = order ? nextStatus(order.status) : null;
  const actionLabel =
    targetStatus === "Ready" ? "Mark as ready" : "Mark as completed";

  async function confirmStatusUpdate() {
    if (!order || !targetStatus) {
      return;
    }

    const previousOrder = order;
    setIsUpdating(true);
    setIsDialogOpen(false);
    setOrder({ ...order, status: targetStatus });

    try {
      setOrder(await updateAdminOrderStatus(order.orderId, targetStatus));
      setError(null);
    } catch (requestError) {
      setOrder(previousOrder);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The order status could not be updated.",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <main className="min-h-[100dvh] bg-canvas-night px-4 py-6 text-white sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/orders"
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to orders
        </Link>

        <div className="mt-5 border-b border-white/15 pb-6">
          <p className="text-sm text-zinc-400">Order details</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <h1 className="break-all font-mono text-xl text-white sm:text-2xl">
              {orderId}
            </h1>
            {order ? <OrderStatusBadge status={order.status} /> : null}
          </div>
        </div>

        <div className="mt-6" aria-live="polite">
          {isLoading ? <LoadingOrderDetails /> : null}

          {!isLoading && error && !order ? (
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
                  <h2 className="font-medium">
                    Order details could not be loaded
                  </h2>
                  <p className="mt-1 text-sm leading-6">{error}</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4 border-rose-100/60 bg-transparent text-rose-50 hover:bg-rose-100/15 hover:text-rose-50"
                    onClick={() => void loadOrder()}
                  >
                    Try again
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {!isLoading && order ? (
            <div className="grid gap-6">
              {error ? (
                <p
                  className="rounded-xl border border-rose-200/50 bg-rose-200/10 px-4 py-3 text-sm text-rose-50"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <section
                className="rounded-xl border border-white/15 bg-canvas-night-elevated p-5 sm:p-6"
                aria-labelledby="order-summary-title"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2
                      id="order-summary-title"
                      className="text-lg font-medium"
                    >
                      Customer order
                    </h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      Verify these details against the customer&apos;s
                      confirmation screen.
                    </p>
                  </div>
                  <ClipboardList
                    aria-hidden="true"
                    className="size-5 shrink-0 text-zinc-400"
                  />
                </div>
                <dl className="mt-6 grid gap-5 border-t border-white/10 pt-5 sm:grid-cols-2">
                  <div className="grid gap-1">
                    <dt className="text-sm text-zinc-400">Customer name</dt>
                    <dd className="text-base font-medium">
                      {order.customerName}
                    </dd>
                  </div>
                  <div className="grid gap-1">
                    <dt className="text-sm text-zinc-400">Created</dt>
                    <dd>
                      <time dateTime={order.createdAt}>
                        {formatOrderTime(order.createdAt)}
                      </time>
                    </dd>
                  </div>
                  <div className="grid gap-1">
                    <dt className="text-sm text-zinc-400">Order total</dt>
                    <dd className="font-mono text-xl tabular-nums">
                      {formatPrice(order.total)}
                    </dd>
                  </div>
                  <div className="grid gap-1">
                    <dt className="text-sm text-zinc-400">Order status</dt>
                    <dd>
                      <OrderStatusBadge status={order.status} />
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                className="overflow-hidden rounded-xl border border-white/15 bg-canvas-night-elevated"
                aria-labelledby="purchased-items-title"
              >
                <div className="border-b border-white/10 px-5 py-4 sm:px-6">
                  <h2
                    id="purchased-items-title"
                    className="text-lg font-medium"
                  >
                    Purchased items
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead className="border-b border-white/10 text-xs tracking-wide text-zinc-400 uppercase">
                      <tr>
                        <th className="px-5 py-3 font-medium sm:px-6">
                          Product
                        </th>
                        <th className="px-5 py-3 font-medium">Quantity</th>
                        <th className="px-5 py-3 font-medium">Unit price</th>
                        <th className="px-5 py-3 text-right font-medium sm:px-6">
                          Line total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <tr
                          key={`${item.productName}-${index}`}
                          className="border-b border-white/10 last:border-0"
                        >
                          <td className="px-5 py-4 font-medium sm:px-6">
                            {item.productName}
                          </td>
                          <td className="px-5 py-4 font-mono tabular-nums">
                            {item.quantity}
                          </td>
                          <td className="px-5 py-4 font-mono tabular-nums text-zinc-300">
                            {formatPrice(item.unitPrice)}
                          </td>
                          <td className="px-5 py-4 text-right font-mono tabular-nums sm:px-6">
                            {formatPrice(item.lineTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {targetStatus ? (
                <section className="rounded-xl border border-white/15 bg-canvas-night-elevated p-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
                  <div>
                    <h2 className="text-lg font-medium">Next step</h2>
                    <p className="mt-1 text-sm leading-6 text-zinc-400">
                      {targetStatus === "Ready"
                        ? "Mark this order ready once every item is prepared."
                        : "Mark this order completed after the customer collects it."}
                    </p>
                  </div>
                  <Button
                    type="button"
                    className="mt-4 w-full bg-white text-black hover:bg-zinc-200 sm:mt-0 sm:w-auto"
                    disabled={isUpdating}
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Check aria-hidden="true" />
                    {isUpdating ? "Updating" : actionLabel}
                  </Button>
                </section>
              ) : (
                <section className="rounded-xl border border-violet-200/40 bg-violet-200/10 p-5 sm:p-6">
                  <h2 className="text-lg font-medium text-violet-50">
                    Completed order
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-violet-100">
                    This order is final and cannot be changed.
                  </p>
                </section>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogTitle>Confirm status change</DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-6 text-muted-foreground">
            {targetStatus === "Ready"
              ? "Confirm that this order is prepared and ready for collection."
              : "Confirm that the customer has collected this order. Completed orders cannot be changed."}
          </DialogDescription>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={() => void confirmStatusUpdate()}>
              {actionLabel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
