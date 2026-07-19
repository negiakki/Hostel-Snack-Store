"use client";

import { Switch } from "@base-ui/react/switch";
import { AlertCircle, CheckCircle2, LoaderCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useStoreStatus } from "@/hooks/use-store-status";
import type { StoreStatus } from "@/lib/store-status";

interface ToastState {
  message: string;
  type: "success" | "error";
}

function LoadingStoreStatus() {
  return (
    <section
      aria-label="Loading store status"
      className="max-w-2xl animate-pulse rounded-xl border border-white/15 bg-canvas-night-elevated p-6 sm:p-8"
    >
      <div className="h-7 w-44 rounded bg-white/15" />
      <div className="mt-3 h-5 w-80 max-w-full rounded bg-white/10" />
      <div className="mt-10 h-px bg-white/15" />
      <div className="mt-7 flex items-center justify-between gap-6">
        <div className="grid gap-3">
          <div className="h-5 w-32 rounded bg-white/15" />
          <div className="h-4 w-52 rounded bg-white/10" />
        </div>
        <div className="h-10 w-20 rounded-full bg-white/15" />
      </div>
      <div className="mt-8 grid gap-3">
        <div className="h-5 w-36 rounded bg-white/15" />
        <div className="h-28 rounded-lg bg-white/10" />
      </div>
      <div className="mt-8 h-11 w-36 rounded-full bg-white/15" />
    </section>
  );
}

export function StoreStatusPage() {
  const { storeStatus, isLoading, error, isMutating, refresh, update } =
    useStoreStatus();
  const [draft, setDraft] = useState<StoreStatus | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displayedStatus = draft ?? storeStatus;

  useEffect(
    () => () => {
      if (toastTimeout.current) {
        clearTimeout(toastTimeout.current);
      }
    },
    [],
  );

  function showToast(toastMessage: string, type: ToastState["type"]) {
    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current);
    }

    setToast({ message: toastMessage, type });
    toastTimeout.current = setTimeout(() => setToast(null), 5000);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isMutating || !displayedStatus) {
      return;
    }

    try {
      await update(displayedStatus);
      setDraft(null);
      showToast("Store status updated.", "success");
    } catch (requestError: unknown) {
      showToast(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update store status.",
        "error",
      );
    }
  }

  return (
    <main className="min-h-[100dvh] bg-canvas-night px-4 py-8 text-white sm:px-6 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="max-w-2xl border-b border-white/15 pb-7">
          <h1 className="font-heading text-4xl font-light tracking-tight sm:text-5xl">
            Store Status
          </h1>
          <p className="mt-3 text-base leading-7 text-zinc-400">
            Control whether the store is currently accepting new orders.
          </p>
        </header>

        <div className="mt-8" aria-live="polite">
          {isLoading ? <LoadingStoreStatus /> : null}

          {!isLoading && error ? (
            <section className="max-w-2xl rounded-xl border border-white/25 bg-canvas-night-elevated p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <AlertCircle
                  className="mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                  strokeWidth={1.75}
                />
                <div>
                  <h2 className="text-lg font-medium">
                    Store status could not be loaded
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {error}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-5 border-white/45 bg-transparent text-white hover:bg-white hover:text-black"
                    onClick={() => void refresh()}
                  >
                    Try again
                  </Button>
                </div>
              </div>
            </section>
          ) : null}

          {!isLoading && !error && displayedStatus ? (
            <section
              aria-labelledby="store-status-card-title"
              className="max-w-2xl rounded-xl border border-white/15 bg-canvas-night-elevated p-6 sm:p-8"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2
                    id="store-status-card-title"
                    className="text-2xl font-medium tracking-tight"
                  >
                    Current Status
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Changes take effect as soon as they are saved.
                  </p>
                </div>
                <span
                  className={
                    displayedStatus.isOpen
                      ? "inline-flex w-fit rounded-full bg-aloe-10 px-3 py-1.5 text-sm font-medium text-black"
                      : "inline-flex w-fit rounded-full border border-white/45 px-3 py-1.5 text-sm font-medium text-white"
                  }
                >
                  {displayedStatus.isOpen ? "Open" : "Closed"}
                </span>
              </div>

              <form
                className="mt-8"
                onSubmit={(event) => void handleSubmit(event)}
              >
                <div className="border-t border-white/15 pt-7">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Label
                        htmlFor="store-status-switch"
                        className="text-base font-medium text-white"
                      >
                        Store is {displayedStatus.isOpen ? "open" : "closed"}
                      </Label>
                      <p className="mt-1 text-sm leading-6 text-zinc-400">
                        {displayedStatus.isOpen
                          ? "Customers can place orders."
                          : "Customers cannot place orders."}
                      </p>
                    </div>
                    <Switch.Root
                      id="store-status-switch"
                      nativeButton
                      checked={displayedStatus.isOpen}
                      disabled={isMutating}
                      onCheckedChange={(isOpen) =>
                        setDraft({ ...displayedStatus, isOpen })
                      }
                      className="flex h-11 w-20 shrink-0 items-center rounded-full border border-white/45 bg-transparent p-1 transition-colors data-checked:border-aloe-10 data-checked:bg-aloe-10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
                      render={<button type="button" />}
                    >
                      <Switch.Thumb className="size-9 rounded-full bg-white transition-transform data-checked:translate-x-9 data-checked:bg-black" />
                    </Switch.Root>
                  </div>
                </div>

                <div className="mt-8 grid gap-2">
                  <Label
                    htmlFor="store-status-message"
                    className="text-base font-medium text-white"
                  >
                    Status message (optional)
                  </Label>
                  <textarea
                    id="store-status-message"
                    value={displayedStatus.message}
                    onChange={(event) =>
                      setDraft({
                        ...displayedStatus,
                        message: event.target.value,
                      })
                    }
                    maxLength={160}
                    disabled={isMutating}
                    placeholder="For example, open until 1 AM"
                    className="min-h-28 w-full resize-y rounded-lg border border-hairline-light bg-white px-3 py-2.5 text-base text-black outline-none placeholder:text-zinc-500 focus-visible:ring-3 focus-visible:ring-white/60 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-600"
                  />
                  <p
                    className="text-right text-xs text-zinc-400"
                    aria-live="polite"
                  >
                    {displayedStatus.message.length}/160 characters
                  </p>
                </div>

                <Button
                  type="submit"
                  className="mt-6 bg-white text-black hover:bg-zinc-200"
                  disabled={isMutating}
                >
                  {isMutating ? (
                    <LoaderCircle className="animate-spin" aria-hidden="true" />
                  ) : null}
                  {isMutating ? "Saving" : "Save Changes"}
                </Button>
              </form>
            </section>
          ) : null}
        </div>
      </div>

      {toast ? (
        <div
          className={
            toast.type === "success"
              ? "fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-aloe-10 bg-aloe-10 px-4 py-3 text-black shadow-2xl"
              : "fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-white/45 bg-canvas-night-elevated px-4 py-3 text-white shadow-2xl"
          }
          role={toast.type === "error" ? "alert" : "status"}
        >
          {toast.type === "success" ? (
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0"
              aria-hidden="true"
            />
          ) : (
            <AlertCircle
              className="mt-0.5 size-5 shrink-0"
              aria-hidden="true"
            />
          )}
          <p className="text-sm leading-6">{toast.message}</p>
          <button
            type="button"
            className="rounded-md p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            aria-label="Dismiss notification"
            onClick={() => setToast(null)}
          >
            <X className="size-4" aria-hidden="true" strokeWidth={1.75} />
          </button>
        </div>
      ) : null}
    </main>
  );
}
