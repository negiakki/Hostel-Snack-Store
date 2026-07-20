"use client";

import Link from "next/link";
import {
  AlertCircle,
  Archive,
  ArrowRight,
  Boxes,
  ClipboardList,
  Package,
  Store,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/use-dashboard";
import type { DashboardData } from "@/lib/dashboard";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function relativeTime(createdAt: string): string {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000),
  );

  if (elapsedMinutes < 1) {
    return "Just now";
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}m ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  return `${elapsedHours}h ago`;
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6" aria-label="Loading dashboard">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-36 animate-pulse rounded-xl border border-border bg-white"
          />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {[0, 1].map((item) => (
          <div
            key={item}
            className="h-72 animate-pulse rounded-xl border border-border bg-white"
          />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-xl border border-border bg-white" />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  icon: typeof ClipboardList;
  tone?: "neutral" | "positive" | "status";
}) {
  const toneClass =
    tone === "positive"
      ? "bg-aloe-10"
      : tone === "status"
        ? "bg-pistachio-10"
        : "bg-canvas-cream";

  return (
    <article className="rounded-xl border border-border bg-white p-5 shadow-[0_8px_8px_rgba(0,0,0,0.06),0_2px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div
          className={`flex size-11 items-center justify-center rounded-full ${toneClass}`}
        >
          <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
        </div>
      </div>
    </article>
  );
}

function ActionLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof Package;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border bg-white px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-pistachio-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black active:translate-y-px"
    >
      <span className="flex items-center gap-3">
        <Icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
        {label}
      </span>
      <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.75} />
    </Link>
  );
}

function DashboardContent({ dashboard }: { dashboard: DashboardData }) {
  const alerts = [
    ...dashboard.inventoryAlerts.outOfStock.map((product) => ({
      ...product,
      label: "Out of stock",
    })),
    ...dashboard.inventoryAlerts.lowStock.map((product) => ({
      ...product,
      label: "Low stock",
    })),
  ];

  return (
    <div className="grid gap-6">
      <section aria-labelledby="summary-title">
        <h2 id="summary-title" className="sr-only">
          Today&apos;s summary
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Orders today"
            value={String(dashboard.summary.ordersToday)}
            icon={ClipboardList}
          />
          <SummaryCard
            label="Revenue today"
            value={formatCurrency(dashboard.summary.revenueToday)}
            icon={TrendingUp}
            tone="positive"
          />
          <SummaryCard
            label="Profit today"
            value={formatCurrency(dashboard.summary.profitToday)}
            icon={TrendingUp}
            tone="positive"
          />
          <SummaryCard
            label="Store status"
            value={dashboard.summary.storeStatus}
            icon={Store}
            tone="status"
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section
          aria-labelledby="active-orders-title"
          className="rounded-xl border border-border bg-white p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2
                id="active-orders-title"
                className="text-lg font-semibold tracking-tight"
              >
                Active orders
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Orders that still need attention tonight.
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black active:translate-y-px"
            >
              Manage Orders
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-canvas-cream p-4">
              <p className="text-sm font-medium text-muted-foreground">
                Placed
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">
                {dashboard.activeOrders.placed}
              </p>
            </div>
            <div className="rounded-lg bg-pistachio-10 p-4">
              <p className="text-sm font-medium text-foreground">Ready</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">
                {dashboard.activeOrders.ready}
              </p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="quick-actions-title"
          className="rounded-xl border border-border bg-white p-5"
        >
          <h2
            id="quick-actions-title"
            className="text-lg font-semibold tracking-tight"
          >
            Quick actions
          </h2>
          <div className="mt-4 grid gap-2">
            <ActionLink
              href="/admin/products"
              label="Products"
              icon={Package}
            />
            <ActionLink
              href="/admin/inventory"
              label="Inventory"
              icon={Boxes}
            />
            <ActionLink
              href="/admin/orders"
              label="Orders"
              icon={ClipboardList}
            />
            <ActionLink
              href="/admin/store-status"
              label="Store Status"
              icon={Store}
            />
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section
          aria-labelledby="inventory-alerts-title"
          className="rounded-xl border border-border bg-white p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2
                id="inventory-alerts-title"
                className="text-lg font-semibold tracking-tight"
              >
                Inventory alerts
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Stock that may need attention.
              </p>
            </div>
            <Link
              href="/admin/inventory"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-black px-5 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black active:translate-y-px"
            >
              Manage Inventory
            </Link>
          </div>

          {alerts.length === 0 ? (
            <div className="mt-8 rounded-lg bg-pistachio-10 px-4 py-5 text-sm font-medium text-foreground">
              Everything is well stocked.
            </div>
          ) : (
            <div className="mt-6 grid gap-2">
              {alerts.map((product) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between gap-4 rounded-lg bg-canvas-cream px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {product.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {product.label}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold">
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section
          aria-labelledby="recent-orders-title"
          className="rounded-xl border border-border bg-white p-5"
        >
          <div>
            <h2
              id="recent-orders-title"
              className="text-lg font-semibold tracking-tight"
            >
              Recent active orders
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The five newest orders still in progress.
            </p>
          </div>

          {dashboard.recentActiveOrders.length === 0 ? (
            <div className="mt-8 rounded-lg border border-dashed border-border px-4 py-8 text-center">
              <Archive
                aria-hidden="true"
                className="mx-auto size-5 text-muted-foreground"
                strokeWidth={1.75}
              />
              <p className="mt-3 text-sm font-medium">
                No active orders right now.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-2">
              {dashboard.recentActiveOrders.map((order) => (
                <Link
                  key={order.orderId}
                  href={`/admin/orders/${order.orderId}`}
                  className="flex items-center justify-between gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-canvas-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {order.customerName}
                    </p>
                    <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                      {order.orderId}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={
                        order.status === "Ready"
                          ? "inline-flex rounded-full bg-pistachio-10 px-2.5 py-1 text-xs font-medium"
                          : "inline-flex rounded-full bg-canvas-cream px-2.5 py-1 text-xs font-medium"
                      }
                    >
                      {order.status}
                    </span>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {relativeTime(order.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { dashboard, isLoading, error, refresh } = useDashboard();

  return (
    <main className="min-h-[100dvh] bg-canvas-cream px-4 py-6 text-foreground sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-border pb-6">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
            A quick view of today&apos;s shop activity.
          </p>
        </header>

        <div className="mt-6" aria-live="polite">
          {isLoading ? <DashboardSkeleton /> : null}
          {!isLoading && error ? (
            <section
              className="rounded-xl border border-red-200 bg-white p-6 text-red-900"
              role="alert"
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0"
                />
                <div>
                  <h2 className="font-semibold">
                    Dashboard could not be loaded
                  </h2>
                  <p className="mt-1 text-sm leading-6">{error}</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4 border-red-300 bg-white text-red-900 hover:bg-red-50"
                    onClick={() => void refresh()}
                  >
                    Try again
                  </Button>
                </div>
              </div>
            </section>
          ) : null}
          {!isLoading && !error && dashboard ? (
            <DashboardContent dashboard={dashboard} />
          ) : null}
        </div>
      </div>
    </main>
  );
}
