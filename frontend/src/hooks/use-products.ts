"use client";

import { useCallback, useEffect, useState } from "react";

import {
  archiveProduct,
  createProduct,
  getAdminProducts,
  type CreateProductInput,
  type Product,
  type ProductFilters,
  restoreProduct,
  updateProduct,
  type UpdateProductInput,
} from "@/lib/products";

function sortByName(products: Product[]): Product[] {
  return [...products].sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}

function matchesFilters(product: Product, filters: ProductFilters): boolean {
  const normalizedSearch = filters.search?.toLocaleLowerCase();
  const normalizedCategory = filters.category?.toLocaleLowerCase();

  return (
    (!normalizedSearch ||
      product.name.toLocaleLowerCase().includes(normalizedSearch)) &&
    (!normalizedCategory ||
      product.category.toLocaleLowerCase() === normalizedCategory)
  );
}

export function useProducts(filters: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setProducts(await getAdminProducts(filters));
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load products.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadProducts() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getAdminProducts(filters, abortController.signal);
        setProducts(result);
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
  }, [filters]);

  const create = useCallback(
    async (input: CreateProductInput) => {
      setIsMutating(true);

      try {
        const product = await createProduct(input);

        if (!filters.archived && matchesFilters(product, filters)) {
          setProducts((currentProducts) =>
            sortByName([...currentProducts, product]),
          );
        }

        return product;
      } finally {
        setIsMutating(false);
      }
    },
    [filters],
  );

  const update = useCallback(
    async (id: string, input: UpdateProductInput) => {
      setIsMutating(true);

      try {
        const product = await updateProduct(id, input);
        setProducts((currentProducts) =>
          sortByName(
            currentProducts
              .map((currentProduct) =>
                currentProduct.id === id ? product : currentProduct,
              )
              .filter((currentProduct) =>
                matchesFilters(currentProduct, filters),
              ),
          ),
        );

        return product;
      } finally {
        setIsMutating(false);
      }
    },
    [filters],
  );

  const archive = useCallback(
    async (id: string) => {
      const previousProducts = products;
      setIsMutating(true);
      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== id),
      );

      try {
        return await archiveProduct(id);
      } catch (requestError) {
        setProducts(previousProducts);
        throw requestError;
      } finally {
        setIsMutating(false);
      }
    },
    [products],
  );

  const restore = useCallback(
    async (id: string) => {
      const previousProducts = products;
      setIsMutating(true);
      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== id),
      );

      try {
        return await restoreProduct(id);
      } catch (requestError) {
        setProducts(previousProducts);
        throw requestError;
      } finally {
        setIsMutating(false);
      }
    },
    [products],
  );

  return {
    products,
    isLoading,
    error,
    isMutating,
    refresh,
    create,
    update,
    archive,
    restore,
  };
}
