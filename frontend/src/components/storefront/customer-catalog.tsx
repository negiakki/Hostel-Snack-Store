"use client";

import { AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { CategoryFilter } from "@/components/storefront/category-filter";
import { CustomerProductCard } from "@/components/storefront/customer-product-card";
import { Button } from "@/components/ui/button";
import { useCustomerCatalog } from "@/hooks/use-customer-catalog";

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="overflow-hidden rounded-xl border border-white/15 bg-canvas-night-elevated"
        >
          <div className="aspect-[4/3] animate-pulse bg-white/10" />
          <div className="grid gap-3 p-4 sm:p-5">
            <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-4 w-2/5 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CustomerCatalog() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { products, isLoading, error, refresh } = useCustomerCatalog();
  const categories = useMemo(
    () =>
      [...new Set(products.map((product) => product.category))].sort((first, second) =>
        first.localeCompare(second),
      ),
    [products],
  );
  const visibleProducts = useMemo(
    () =>
      selectedCategory
        ? products.filter((product) => product.category === selectedCategory)
        : products,
    [products, selectedCategory],
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
      <section aria-labelledby="catalog-title">
        <p className="text-sm text-zinc-400">Tonight&apos;s selection</p>
        <h1 id="catalog-title" className="mt-2 text-4xl font-light tracking-tight sm:text-5xl">
          Snacks for tonight
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-zinc-300">
          Pick from what&apos;s ready in the store right now.
        </p>

        {!isLoading && !error && categories.length > 0 ? (
          <div className="mt-7">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
        ) : null}
      </section>

      <section className="mt-8" aria-live="polite" aria-labelledby="catalog-title">
        {isLoading ? <CatalogSkeleton /> : null}

        {!isLoading && error ? (
          <div className="max-w-xl rounded-xl border border-white/25 bg-canvas-night-elevated p-6">
            <AlertCircle className="size-5" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-medium">Products could not be loaded</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">{error}</p>
            <Button
              type="button"
              variant="outline"
              className="mt-5 border-white/45 bg-transparent text-white hover:bg-white hover:text-black"
              onClick={() => void refresh()}
            >
              Try again
            </Button>
          </div>
        ) : null}

        {!isLoading && !error && visibleProducts.length === 0 ? (
          <div className="max-w-xl rounded-xl border border-dashed border-white/30 px-6 py-14 text-center">
            <h2 className="text-xl font-medium">No snacks are available right now</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {selectedCategory
                ? "Choose another category to see more products."
                : "Please check back after products have been added."}
            </p>
          </div>
        ) : null}

        {!isLoading && !error && visibleProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => (
              <CustomerProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
