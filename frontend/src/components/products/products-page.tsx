"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Plus, Search, X } from "lucide-react";

import { ArchiveProductDialog } from "@/components/products/archive-product-dialog";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { ProductsTable } from "@/components/products/products-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts } from "@/hooks/use-products";
import type {
  CreateProductInput,
  Product,
  ProductFilters,
  UpdateProductInput,
} from "@/lib/products";

type VisibilityFilter = "active" | "archived";

interface ToastState {
  message: string;
  type: "success" | "error";
}

function LoadingTable() {
  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-card"
      aria-label="Loading products"
    >
      <div className="grid gap-4 p-5">
        {[0, 1, 2, 3].map((row) => (
          <div
            key={row}
            className="grid grid-cols-[2fr_1fr_0.7fr_0.5fr_1fr] items-center gap-5"
          >
            <div className="h-11 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 animate-pulse rounded bg-muted" />
            <div className="h-4 animate-pulse rounded bg-muted" />
            <div className="h-4 animate-pulse rounded bg-muted" />
            <div className="h-8 animate-pulse rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductsPage() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [category, setCategory] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<VisibilityFilter>("active");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToArchive, setProductToArchive] = useState<Product | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const archived = visibility === "archived";
  const filters = useMemo<ProductFilters>(
    () => ({
      search: deferredSearch.trim() || undefined,
      category: category ?? undefined,
      archived,
    }),
    [archived, category, deferredSearch],
  );
  const {
    products,
    isLoading,
    error,
    isMutating,
    refresh,
    create,
    update,
    archive,
    restore,
  } = useProducts(filters);

  const categories = useMemo(
    () =>
      [...new Set(products.map((product) => product.category))].sort(
        (first, second) => first.localeCompare(second),
      ),
    [products],
  );

  useEffect(
    () => () => {
      if (toastTimeout.current) {
        clearTimeout(toastTimeout.current);
      }
    },
    [],
  );

  function showToast(message: string, type: ToastState["type"]) {
    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current);
    }

    setToast({ message, type });
    toastTimeout.current = setTimeout(() => setToast(null), 5000);
  }

  function openCreateDialog() {
    setSelectedProduct(null);
    setIsFormOpen(true);
  }

  function openEditDialog(product: Product) {
    setSelectedProduct(product);
    setIsFormOpen(true);
  }

  async function handleProductSubmit(
    input: CreateProductInput | UpdateProductInput,
  ) {
    try {
      if (selectedProduct) {
        await update(selectedProduct.id, input as UpdateProductInput);
        showToast("Product updated.", "success");
      } else {
        await create(input as CreateProductInput);
        showToast("Product created.", "success");
      }

      setIsFormOpen(false);
      setSelectedProduct(null);
    } catch (requestError: unknown) {
      showToast(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save the product.",
        "error",
      );
    }
  }

  async function handleArchive() {
    if (!productToArchive) {
      return;
    }

    try {
      await archive(productToArchive.id);
      showToast(productToArchive.name + " archived.", "success");
      setProductToArchive(null);
    } catch (requestError: unknown) {
      showToast(
        requestError instanceof Error
          ? requestError.message
          : "Unable to archive the product.",
        "error",
      );
    }
  }

  async function handleRestore(product: Product) {
    try {
      await restore(product.id);
      showToast(product.name + " restored.", "success");
    } catch (requestError: unknown) {
      showToast(
        requestError instanceof Error
          ? requestError.message
          : "Unable to restore the product.",
        "error",
      );
    }
  }

  return (
    <main className="min-h-[100dvh] bg-background px-4 py-6 text-foreground sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep tonight&apos;s selection clear, accurate, and ready to sell.
            </p>
          </div>
          <Button type="button" onClick={openCreateDialog} disabled={isMutating}>
            <Plus aria-hidden="true" />
            Add product
          </Button>
        </div>

        <section className="mt-6" aria-labelledby="product-list-title">
          <h2 id="product-list-title" className="sr-only">
            Product management
          </h2>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_170px]">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                aria-label="Search products by name"
                className="h-11 pl-10"
                placeholder="Search products"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All categories</SelectItem>
                {categories.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={visibility}
              onValueChange={(value) =>
                setVisibility(value === "archived" ? "archived" : "active")
              }
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active products</SelectItem>
                <SelectItem value="archived">Archived products</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="mt-5" aria-live="polite">
          {isLoading ? <LoadingTable /> : null}

          {!isLoading && error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-900">
              <div className="flex items-start gap-3">
                <AlertCircle
                  className="mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="font-medium">Products could not be loaded</h2>
                  <p className="mt-1 text-sm leading-6">{error}</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4 border-red-300 bg-white text-red-900 hover:bg-red-100"
                    onClick={() => void refresh()}
                  >
                    Try again
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {!isLoading && !error && products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/35 px-6 py-14 text-center">
              <h2 className="text-lg font-medium">
                {archived ? "No archived products" : "No products found"}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {archived
                  ? "Archived products will appear here and can be restored when needed."
                  : search || category
                    ? "Try a different search or category."
                    : "Add the first product to start building tonight's menu."}
              </p>
              {!archived && !search && !category ? (
                <Button type="button" className="mt-5" onClick={openCreateDialog}>
                  <Plus aria-hidden="true" />
                  Add product
                </Button>
              ) : null}
            </div>
          ) : null}

          {!isLoading && !error && products.length > 0 ? (
            <ProductsTable
              products={products}
              isArchivedView={archived}
              isPending={isMutating}
              onEdit={openEditDialog}
              onArchive={setProductToArchive}
              onRestore={(product) => void handleRestore(product)}
            />
          ) : null}
        </section>
      </div>

      {isFormOpen ? (
        <ProductFormDialog
          open={isFormOpen}
          product={selectedProduct}
          isSubmitting={isMutating}
          onOpenChange={setIsFormOpen}
          onSubmit={handleProductSubmit}
        />
      ) : null}
      <ArchiveProductDialog
        product={productToArchive}
        isSubmitting={isMutating}
        onOpenChange={(open) => {
          if (!open) {
            setProductToArchive(null);
          }
        }}
        onConfirm={handleArchive}
      />

      {toast ? (
        <div
          className={
            toast.type === "success"
              ? "fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-950 shadow-lg"
              : "fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-900 shadow-lg"
          }
          role={toast.type === "error" ? "alert" : "status"}
        >
          <p className="text-sm leading-6">{toast.message}</p>
          <button
            type="button"
            className="rounded-md p-1 focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label="Dismiss notification"
            onClick={() => setToast(null)}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </main>
  );
}
