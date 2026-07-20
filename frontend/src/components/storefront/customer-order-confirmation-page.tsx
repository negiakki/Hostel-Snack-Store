"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import {
  clearOrderConfirmation,
  getOrderConfirmation,
  getOrderConfirmationServerSnapshot,
  subscribeToOrderConfirmation,
} from "@/lib/order-confirmation";
import type { CreatedOrder } from "@/lib/orders";

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

export function CustomerOrderConfirmationPage() {
  const order = useSyncExternalStore<CreatedOrder | null>(
    subscribeToOrderConfirmation,
    getOrderConfirmation,
    getOrderConfirmationServerSnapshot,
  );

  if (!order) {
    return (
      <main className="min-h-[calc(100dvh-4rem)] bg-canvas-light px-4 py-10 text-black sm:px-6 lg:px-10">
        <section className="mx-auto w-full max-w-xl rounded-xl border border-hairline-light px-6 py-14 text-center sm:px-10">
          <h1 className="text-3xl font-light tracking-tight">
            Confirmation unavailable
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            We could not find an order confirmation for this browser session.
          </p>
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            className="mt-7 bg-black text-white hover:bg-zinc-700"
          >
            Back to Store
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-canvas-light px-4 py-10 text-black sm:px-6 lg:px-10">
      <section className="mx-auto w-full max-w-xl rounded-xl border border-hairline-light p-6 sm:p-8">
        <p className="text-sm text-zinc-600">Order confirmation</p>
        <h1 className="mt-2 text-4xl font-light tracking-tight sm:text-5xl">
          Order placed successfully
        </h1>

        <dl className="mt-8 grid gap-5 border-t border-hairline-light pt-5">
          <div className="grid gap-1">
            <dt className="text-sm text-zinc-600">Order ID</dt>
            <dd className="break-all font-mono text-sm text-black">
              {order.orderId}
            </dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-sm text-zinc-600">Order status</dt>
            <dd className="text-base font-medium text-black">{order.status}</dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-sm text-zinc-600">Order total</dt>
            <dd className="font-mono text-xl tabular-nums text-black">
              {formatPrice(order.total)}
            </dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-sm text-zinc-600">Order created</dt>
            <dd className="text-base text-black">
              <time dateTime={order.createdAt}>
                {formatOrderTime(order.createdAt)}
              </time>
            </dd>
          </div>
        </dl>

        <section
          className="mt-8 border-t border-hairline-light pt-5"
          aria-labelledby="pickup-guidance-title"
        >
          <h2
            id="pickup-guidance-title"
            className="text-base font-medium text-black"
          >
            Please save this confirmation by taking a screenshot.
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-700">
            Show this screenshot when collecting your order. Your Order ID helps
            us quickly verify your purchase and hand over the correct items.
          </p>
        </section>

        <Button
          render={<Link href="/" />}
          nativeButton={false}
          className="mt-8 w-full bg-black text-white hover:bg-zinc-700"
          onClick={clearOrderConfirmation}
        >
          Back to Store
        </Button>
      </section>
    </main>
  );
}
