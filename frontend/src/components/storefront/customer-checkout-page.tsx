"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";

import { useCart } from "@/components/storefront/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveOrderConfirmation } from "@/lib/order-confirmation";
import { createOrder } from "@/lib/orders";

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function CustomerCheckoutPage() {
  const router = useRouter();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const submissionInFlightRef = useRef(false);
  const [customerName, setCustomerName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { items, total, clearCart, setCheckoutLocked } = useCart();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = customerName.trim();

    if (!trimmedName) {
      setNameError("Enter your name to place the order.");
      nameInputRef.current?.focus();
      return;
    }

    if (items.length === 0) {
      setSubmissionError("Your cart is empty. Add snacks before placing an order.");
      return;
    }

    if (submissionInFlightRef.current) {
      return;
    }

    submissionInFlightRef.current = true;
    setIsSubmitting(true);
    setCheckoutLocked(true);
    setNameError(null);
    setSubmissionError(null);

    try {
      const order = await createOrder({
        customerName: trimmedName,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });

      saveOrderConfirmation(order);
      clearCart();
      router.replace("/order-confirmation");
    } catch (error: unknown) {
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "We could not place your order. Please try again.",
      );
      setIsSubmitting(false);
      setCheckoutLocked(false);
      submissionInFlightRef.current = false;
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-[calc(100dvh-4rem)] bg-canvas-light px-4 py-10 text-black sm:px-6 lg:px-10">
        <section className="mx-auto w-full max-w-xl rounded-xl border border-dashed border-hairline-light px-6 py-14 text-center sm:px-10">
          <h1 className="text-3xl font-light tracking-tight">Your cart is empty</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Add a few snacks before you check out.
          </p>
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            className="mt-7 bg-black text-white hover:bg-zinc-700"
          >
            Browse snacks
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-canvas-light px-4 py-8 text-black sm:px-6 sm:py-10 lg:px-10 lg:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <div>
          <p className="text-sm text-zinc-600">Checkout</p>
          <h1 className="mt-2 text-4xl font-light tracking-tight sm:text-5xl">
            Review your order
          </h1>
        </div>

        <form className="mt-8 grid gap-8" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
          <div className="grid gap-2">
            <Label htmlFor="customer-name" className="text-sm font-medium text-black">
              Customer name
            </Label>
            <Input
              ref={nameInputRef}
              id="customer-name"
              name="customerName"
              value={customerName}
              onChange={(event) => {
                setCustomerName(event.target.value);
                setNameError(null);
                setSubmissionError(null);
              }}
              disabled={isSubmitting}
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? "customer-name-error" : undefined}
              className="h-11 border-hairline-light bg-white px-3 text-base text-black placeholder:text-zinc-500 focus-visible:border-black focus-visible:ring-black/20"
              autoComplete="name"
            />
            {nameError ? (
              <p id="customer-name-error" className="text-sm leading-6 text-black" role="alert">
                {nameError}
              </p>
            ) : null}
          </div>

          <section aria-labelledby="order-summary-title" className="rounded-xl border border-hairline-light p-5 sm:p-6">
            <h2 id="order-summary-title" className="text-lg font-medium">Order summary</h2>
            <ul className="mt-5 grid gap-4" aria-label="Order items">
              {items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 text-sm">
                  <p className="min-w-0 text-zinc-700">
                    <span className="font-medium text-black">{item.quantity}x</span> {item.name}
                  </p>
                  <p className="shrink-0 font-mono tabular-nums text-black">
                    {formatPrice(item.sellingPrice * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center justify-between border-t border-hairline-light pt-5">
              <p className="text-base font-medium">Order total</p>
              <p className="font-mono text-xl tabular-nums text-black">{formatPrice(total)}</p>
            </div>
          </section>

          {submissionError ? (
            <div className="rounded-xl border border-black bg-white p-4" role="alert">
              <p className="text-sm font-medium text-black">Your order could not be placed</p>
              <p className="mt-1 text-sm leading-6 text-zinc-700">{submissionError}</p>
            </div>
          ) : null}

          <div>
            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-zinc-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Placing your order..." : "Place order"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
