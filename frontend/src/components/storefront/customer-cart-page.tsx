"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { useCart } from "@/components/storefront/cart-provider";
import { Button } from "@/components/ui/button";

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function CustomerCartPage() {
  const {
    items,
    total,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
  } = useCart();

  if (items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center px-4 py-10 sm:px-6 lg:px-10">
        <section
          aria-labelledby="empty-cart-title"
          className="w-full max-w-xl rounded-xl border border-dashed border-white/30 bg-canvas-night-elevated px-6 py-14 text-center sm:px-10"
        >
          <ShoppingBag className="mx-auto size-6 text-aloe-10" aria-hidden="true" />
          <h1 id="empty-cart-title" className="mt-5 text-3xl font-light tracking-tight">
            Your cart is empty
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-300">
            Add a few snacks from tonight&apos;s selection to see them here.
          </p>
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            className="mt-7 bg-aloe-10 text-black hover:bg-pistachio-10"
          >
            Browse snacks
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-400">Tonight&apos;s order</p>
          <h1 className="mt-2 text-4xl font-light tracking-tight sm:text-5xl">Your cart</h1>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="text-zinc-300 hover:bg-white/10 hover:text-white"
          onClick={clearCart}
        >
          Clear cart
        </Button>
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-label="Cart items">
          <ul className="overflow-hidden rounded-xl border border-white/15 bg-canvas-night-elevated">
            {items.map((item) => {
              const canIncreaseQuantity = item.quantity < item.stock;

              return (
                <li
                  key={item.id}
                  className="grid grid-cols-[5rem_minmax(0,1fr)] gap-4 border-b border-white/10 p-4 last:border-b-0 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto] sm:p-5"
                >
                  <div className="aspect-square overflow-hidden rounded-lg bg-surface-elevated-dark">
                    {/* External product image URLs are user-managed and cannot use Next Image remote patterns. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.name} className="size-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-medium text-white sm:text-lg">
                      {item.name}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-400">{formatPrice(item.sellingPrice)} each</p>
                    <div className="mt-4 flex items-center gap-2" aria-label={`Quantity for ${item.name}`}>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-xs"
                        className="border-white/25 bg-transparent text-white hover:bg-white hover:text-black"
                        onClick={() => decrementItem(item.id)}
                      >
                        <Minus aria-hidden="true" />
                        <span className="sr-only">Decrease quantity of {item.name}</span>
                      </Button>
                      <span className="min-w-8 text-center font-mono text-sm tabular-nums text-white" aria-live="polite">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-xs"
                        className="border-white/25 bg-transparent text-white hover:bg-white hover:text-black"
                        onClick={() => incrementItem(item.id)}
                        disabled={!canIncreaseQuantity}
                      >
                        <Plus aria-hidden="true" />
                        <span className="sr-only">Increase quantity of {item.name}</span>
                      </Button>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:flex-col sm:items-end">
                    <p className="font-mono text-base tabular-nums text-white">
                      {formatPrice(item.sellingPrice * item.quantity)}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-zinc-300 hover:bg-white/10 hover:text-white"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 aria-hidden="true" />
                      Remove
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="rounded-xl border border-white/15 bg-canvas-night-elevated p-5 sm:p-6">
          <h2 className="text-lg font-medium">Order summary</h2>
          <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-5">
            <p className="text-sm text-zinc-300">Order total</p>
            <p className="font-mono text-xl tabular-nums text-white">{formatPrice(total)}</p>
          </div>
          <Button
            type="button"
            className="mt-6 w-full bg-aloe-10 text-black hover:bg-pistachio-10"
            disabled
            aria-describedby="checkout-phase-note"
          >
            Proceed to Checkout
          </Button>
          <p id="checkout-phase-note" className="mt-3 text-center text-xs leading-5 text-zinc-400">
            Checkout will be available in Phase 5D.
          </p>
        </aside>
      </div>
    </main>
  );
}
