"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getAdminOrders } from "@/lib/admin-orders";
import type { AdminOrderSummary } from "@/lib/admin-orders";

const POLLING_INTERVAL_MS = 20_000;

export function useOrders() {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMounted = useRef(true);
  const requestInFlight = useRef(false);

  const loadOrders = useCallback(async (isManualRefresh = false) => {
    if (requestInFlight.current) {
      return;
    }

    requestInFlight.current = true;

    if (isManualRefresh && isMounted.current) {
      setIsRefreshing(true);
    }

    try {
      const nextOrders = await getAdminOrders();

      if (!isMounted.current) {
        return;
      }

      setOrders(nextOrders);
      setError(null);
    } catch (requestError) {
      if (!isMounted.current) {
        return;
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Orders could not be loaded.",
      );
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
      requestInFlight.current = false;
    }
  }, []);

  const refresh = useCallback(() => loadOrders(true), [loadOrders]);

  useEffect(() => {
    isMounted.current = true;

    async function pollOrders() {
      await loadOrders();
    }

    void pollOrders();

    const interval = window.setInterval(
      () => void loadOrders(),
      POLLING_INTERVAL_MS,
    );

    return () => {
      isMounted.current = false;
      window.clearInterval(interval);
    };
  }, [loadOrders]);

  return {
    orders,
    isLoading,
    error,
    isRefreshing,
    refresh,
  };
}
