"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { useCart } from "@/components/storefront/cart-provider";
import { Button } from "@/components/ui/button";

export function CustomerStorefrontHeader() {
  const { itemCount } = useCart();

  return (
    <header className="border-b border-white/15 bg-canvas-night text-white">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link href="/" className="text-lg font-medium tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          Hostel Snack Store
        </Link>
        <div className="flex items-center gap-3">
          <p className="hidden rounded-full border border-white/35 px-3 py-1 text-xs font-medium sm:block">
            Open now
          </p>
          <Button
            render={<Link href="/cart" />}
            nativeButton={false}
            variant="outline"
            size="icon-sm"
            className="relative border-white/35 bg-transparent text-white hover:bg-white hover:text-black"
            aria-label={`Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
          >
            <ShoppingBag aria-hidden="true" />
            {itemCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-aloe-10 text-[0.7rem] font-semibold tabular-nums text-black">
                {itemCount}
              </span>
            ) : null}
          </Button>
        </div>
      </div>
    </header>
  );
}
