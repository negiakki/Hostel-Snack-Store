"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getAdminOrders } from "@/lib/admin-orders";
import type { AdminOrderSummary } from "@/lib/admin-orders";

const POLLING_INTERVAL_MS = 20_000;

export function useOrders() {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const refresh = useCallback(async () => {
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
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;

    async function pollOrders() {
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
        }
      }
    }

    void pollOrders();

    const interval = window.setInterval(
      () => void pollOrders(),
      POLLING_INTERVAL_MS,
    );

    return () => {
      isMounted.current = false;
      window.clearInterval(interval);
    };
  }, []);

  return {
    orders,
    isLoading,
    error,
    refresh,
  };
}
