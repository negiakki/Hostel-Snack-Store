"use client";

import { AlertCircle, LoaderCircle } from "lucide-react";

import { useStoreStatus } from "@/hooks/use-store-status";

export function CustomerStoreStatusBanner() {
  const { storeStatus, isLoading, error } = useStoreStatus();

  if (isLoading) {
    return (
      <div
        role="status"
        className="flex min-h-12 items-center gap-2 border border-zinc-200 bg-white px-4 text-sm text-zinc-600"
      >
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        Checking store availability
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="status"
        className="border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-700"
      >
        Store availability could not be confirmed. You can still browse the
        store.
      </div>
    );
  }

  if (!storeStatus || storeStatus.isOpen) {
    return null;
  }

  return (
    <section
      aria-label="Store status"
      className="border-2 border-black bg-white px-4 py-4 text-black sm:px-6"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-medium">Store is currently closed</p>
          <p className="mt-1 text-sm leading-6 text-zinc-700">
            {storeStatus.message || "Store is currently closed."}
          </p>
        </div>
      </div>
    </section>
  );
}
