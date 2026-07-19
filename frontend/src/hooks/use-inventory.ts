"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  adjustStock,
  getInventoryProducts,
  type InventoryProduct,
  type StockOperation,
} from "@/lib/inventory";

function sortByName(products: InventoryProduct[]): InventoryProduct[] {
  return [...products].sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}

export function useInventory() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submissionInProgress = useRef(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setProducts(sortByName(await getInventoryProducts()));
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load inventory.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadInventory() {
      setIsLoading(true);
      setError(null);

      try {
        setProducts(
          sortByName(await getInventoryProducts(abortController.signal)),
        );
      } catch (requestError: unknown) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load inventory.",
        );
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadInventory();

    return () => abortController.abort();
  }, []);

  const submitAdjustment = useCallback(
    async (productId: string, operation: StockOperation, value: number) => {
      if (submissionInProgress.current) {
        return "A stock adjustment is already in progress.";
      }

      submissionInProgress.current = true;
      setIsSubmitting(true);

      try {
        const result = await adjustStock(productId, operation, value);
        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product.id === productId
              ? {
                  ...product,
                  stock: result.stock,
                  lowStockThreshold: result.lowStockThreshold,
                  isLowStock: result.isLowStock,
                  isOutOfStock: result.isOutOfStock,
                }
              : product,
          ),
        );

        try {
          setProducts(sortByName(await getInventoryProducts()));
          return null;
        } catch {
          return "Stock updated, but the latest inventory could not be loaded.";
        }
      } finally {
        submissionInProgress.current = false;
        setIsSubmitting(false);
      }
    },
    [],
  );

  return {
    products,
    isLoading,
    isSubmitting,
    error,
    refresh,
    submitAdjustment,
  };
}
