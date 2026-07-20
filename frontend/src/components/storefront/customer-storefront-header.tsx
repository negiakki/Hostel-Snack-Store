"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";

import { useCart } from "@/components/storefront/cart-provider";
import { Button } from "@/components/ui/button";

export function CustomerStorefrontHeader() {
  const { itemCount, isCheckoutLocked } = useCart();
  const pathname = usePathname();
  const usesLightSurface =
    pathname === "/checkout" || pathname === "/order-confirmation";
  const shellClassName = usesLightSurface
    ? "border-hairline-light bg-canvas-light text-black"
    : "border-white/15 bg-canvas-night text-white";
  const linkClassName = usesLightSurface
    ? "focus-visible:outline-black"
    : "focus-visible:outline-white";
  const statusClassName = usesLightSurface
    ? "border-black/35 text-black"
    : "border-white/35 text-white";
  const cartClassName = usesLightSurface
    ? "border-black/35 bg-transparent text-black hover:bg-black hover:text-white"
    : "border-white/35 bg-transparent text-white hover:bg-white hover:text-black";

  return (
    <header className={`border-b ${shellClassName}`}>
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link href="/" className={`text-lg font-medium tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 ${linkClassName}`}>
          Hostel Snack Store
        </Link>
        <div className="flex items-center gap-3">
          <p className={`hidden rounded-full border px-3 py-1 text-xs font-medium sm:block ${statusClassName}`}>
            Open now
          </p>
          {isCheckoutLocked ? (
            <span
              className={`relative inline-grid size-11 place-items-center rounded-full border opacity-50 ${cartClassName}`}
              aria-label="Cart is unavailable while your order is being placed"
              aria-disabled="true"
            >
              <ShoppingBag aria-hidden="true" />
              {itemCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-aloe-10 text-[0.7rem] font-semibold tabular-nums text-black">
                  {itemCount}
                </span>
              ) : null}
            </span>
          ) : (
            <Button
              render={<Link href="/cart" />}
              nativeButton={false}
              variant="outline"
              size="icon-sm"
              className={`relative ${cartClassName}`}
              aria-label={`Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
            >
              <ShoppingBag aria-hidden="true" />
              {itemCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-aloe-10 text-[0.7rem] font-semibold tabular-nums text-black">
                  {itemCount}
                </span>
              ) : null}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
