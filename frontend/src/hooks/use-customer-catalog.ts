"use client";

import { useCallback, useEffect, useState } from "react";

import { getProducts, type Product } from "@/lib/products";

export function useCustomerCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setProducts(await getProducts({ archived: false }));
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load products.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadProducts() {
      setIsLoading(true);
      setError(null);

      try {
        setProducts(
          await getProducts({ archived: false }, abortController.signal),
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
            : "Unable to load products.",
        );
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadProducts();

    return () => abortController.abort();
  }, []);

  return { products, isLoading, error, refresh };
}
