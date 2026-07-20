"use client";

import { useRouter } from "next/navigation";

import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import type { AdminOrderSummary } from "@/lib/admin-orders";

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatRelativeTime(value: string): string {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 1000),
  );

  if (elapsedSeconds < 60) return "Just now";
  if (elapsedSeconds < 3600)
    return `${Math.floor(elapsedSeconds / 60)} min ago`;
  if (elapsedSeconds < 86_400)
    return `${Math.floor(elapsedSeconds / 3600)} hour${Math.floor(elapsedSeconds / 3600) === 1 ? "" : "s"} ago`;
  return `${Math.floor(elapsedSeconds / 86_400)} day${Math.floor(elapsedSeconds / 86_400) === 1 ? "" : "s"} ago`;
}

function orderPath(orderId: string): string {
  return `/admin/orders/${encodeURIComponent(orderId)}`;
}

export function OrdersTable({ orders }: { orders: AdminOrderSummary[] }) {
  const router = useRouter();

  function openOrder(orderId: string) {
    router.push(orderPath(orderId));
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-white/15 bg-canvas-night-elevated md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-white/15 text-xs tracking-wide text-zinc-400 uppercase">
              <tr>
                <th className="px-5 py-4 font-medium">Order ID</th>
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Items</th>
                <th className="px-5 py-4 font-medium">Total</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Placed</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.orderId}
                  tabIndex={0}
                  role="link"
                  className="cursor-pointer border-b border-white/10 text-zinc-100 transition-colors last:border-0 hover:bg-white/5 focus-visible:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
                  onClick={() => openOrder(order.orderId)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openOrder(order.orderId);
                    }
                  }}
                >
                  <td className="px-5 py-4 font-mono text-xs text-zinc-300">
                    {order.orderId}
                  </td>
                  <td className="px-5 py-4 font-medium">
                    {order.customerName}
                  </td>
                  <td className="px-5 py-4 tabular-nums">{order.itemCount}</td>
                  <td className="px-5 py-4 font-mono tabular-nums">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-5 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4 text-zinc-300">
                    <time dateTime={order.createdAt}>
                      {formatRelativeTime(order.createdAt)}
                    </time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {orders.map((order) => (
          <button
            key={order.orderId}
            type="button"
            className="rounded-xl border border-white/15 bg-canvas-night-elevated p-4 text-left text-zinc-100 transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={() => openOrder(order.orderId)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{order.customerName}</p>
                <p className="mt-1 break-all font-mono text-xs text-zinc-400">
                  {order.orderId}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 text-sm text-zinc-300">
              <span>
                {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
              </span>
              <span className="font-mono tabular-nums text-white">
                {formatPrice(order.total)}
              </span>
            </div>
            <time
              className="mt-3 block text-xs text-zinc-400"
              dateTime={order.createdAt}
            >
              {formatRelativeTime(order.createdAt)}
            </time>
          </button>
        ))}
      </div>
    </>
  );
}
