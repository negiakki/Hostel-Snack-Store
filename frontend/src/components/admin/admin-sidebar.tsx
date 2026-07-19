"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Package, Store, X } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const navigationItems = [
  {
    href: "/admin/store-status",
    label: "Store Status",
    icon: Store,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Package,
  },
] as const;

interface NavigationLinksProps {
  onNavigate?: () => void;
}

function NavigationLinks({ onNavigate }: NavigationLinksProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="grid gap-1">
      {navigationItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
              isActive
                ? "bg-white text-black"
                : "text-zinc-300 hover:bg-white/10 hover:text-white",
            )}
            onClick={onNavigate}
          >
            <Icon className="size-4" aria-hidden="true" strokeWidth={1.75} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar() {
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-white/15 bg-canvas-night px-4 py-6 text-white md:flex md:flex-col">
        <div className="px-3">
          <p className="text-lg font-medium tracking-tight">
            Hostel Snack Store
          </p>
          <p className="mt-1 text-sm text-zinc-400">Admin</p>
        </div>
        <div className="mt-8">
          <NavigationLinks />
        </div>
      </aside>

      <header className="flex min-h-16 items-center justify-between border-b border-white/15 bg-canvas-night px-4 text-white md:hidden">
        <p className="text-base font-medium tracking-tight">
          Hostel Snack Store
        </p>
        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-full border border-white/35 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label="Open navigation"
          aria-expanded={isMobileNavigationOpen}
          onClick={() => setIsMobileNavigationOpen(true)}
        >
          <Menu className="size-5" aria-hidden="true" strokeWidth={1.75} />
        </button>
      </header>

      {isMobileNavigationOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/65"
            aria-label="Close navigation"
            onClick={() => setIsMobileNavigationOpen(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            className="relative flex min-h-full w-72 flex-col bg-canvas-night p-5 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-medium tracking-tight">
                  Hostel Snack Store
                </p>
                <p className="mt-1 text-sm text-zinc-400">Admin</p>
              </div>
              <button
                type="button"
                className="flex size-11 items-center justify-center rounded-full border border-white/35 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="Close navigation"
                onClick={() => setIsMobileNavigationOpen(false)}
              >
                <X className="size-5" aria-hidden="true" strokeWidth={1.75} />
              </button>
            </div>
            <div className="mt-8">
              <NavigationLinks
                onNavigate={() => setIsMobileNavigationOpen(false)}
              />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
