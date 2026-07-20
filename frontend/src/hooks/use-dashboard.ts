"use client";

import { useCallback, useEffect, useState } from "react";

import { getDashboard, type DashboardData } from "@/lib/dashboard";

export function useDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      setDashboard(await getDashboard(signal));
    } catch (requestError) {
      if (
        requestError instanceof DOMException &&
        requestError.name === "AbortError"
      ) {
        return;
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Dashboard could not be loaded.",
      );
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        setDashboard(await getDashboard(abortController.signal));
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Dashboard could not be loaded.",
        );
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => abortController.abort();
  }, []);

  return {
    dashboard,
    isLoading,
    error,
    refresh: () => load(),
  };
}
