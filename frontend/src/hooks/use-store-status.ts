"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getStoreStatus,
  type StoreStatus,
  updateStoreStatus,
  type UpdateStoreStatusInput,
} from "@/lib/store-status";

export function useStoreStatus() {
  const [storeStatus, setStoreStatus] = useState<StoreStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setStoreStatus(await getStoreStatus());
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load store status.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadStoreStatus() {
      setIsLoading(true);
      setError(null);

      try {
        setStoreStatus(await getStoreStatus(abortController.signal));
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
            : "Unable to load store status.",
        );
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadStoreStatus();

    return () => abortController.abort();
  }, []);

  const update = useCallback(async (input: UpdateStoreStatusInput) => {
    setIsMutating(true);

    try {
      const updatedStatus = await updateStoreStatus(input);
      setStoreStatus(updatedStatus);
      return updatedStatus;
    } finally {
      setIsMutating(false);
    }
  }, []);

  return {
    storeStatus,
    isLoading,
    error,
    isMutating,
    refresh,
    update,
  };
}
