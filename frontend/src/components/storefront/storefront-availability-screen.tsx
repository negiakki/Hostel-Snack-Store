import { AlertCircle, LoaderCircle, Store } from "lucide-react";

import { Button } from "@/components/ui/button";

type AvailabilityScreenState = "loading" | "closed" | "unavailable";

interface StorefrontAvailabilityScreenProps {
  state: AvailabilityScreenState;
  message?: string;
  isRetrying?: boolean;
  onRetry?: () => void;
}

const screenContent = {
  loading: {
    title: "Checking store availability",
    description: "Please wait while we confirm whether ordering is available.",
  },
  closed: {
    title: "Store is currently closed",
    description: "Ordering is unavailable right now. Please check again when the store opens.",
  },
  unavailable: {
    title: "Ordering is temporarily unavailable",
    description: "We could not confirm the store status. Try again before browsing the catalog.",
  },
} as const;

export function StorefrontAvailabilityScreen({
  state,
  message,
  isRetrying = false,
  onRetry,
}: StorefrontAvailabilityScreenProps) {
  const content = screenContent[state];
  const Icon = state === "loading" ? LoaderCircle : state === "closed" ? Store : AlertCircle;

  return (
    <main
      className="flex min-h-[100dvh] items-center bg-canvas-night px-4 py-8 text-white sm:px-6"
      aria-live="polite"
    >
      <section
        aria-labelledby="storefront-availability-title"
        className="mx-auto w-full max-w-lg rounded-xl border border-white/20 bg-canvas-night-elevated p-6 sm:p-8"
      >
        <Icon
          className={state === "loading" ? "size-6 animate-spin" : "size-6"}
          aria-hidden="true"
        />
        <h1
          id="storefront-availability-title"
          className="mt-6 text-3xl font-light tracking-tight sm:text-4xl"
        >
          {content.title}
        </h1>
        <p className="mt-3 text-base leading-7 text-zinc-300">
          {message || content.description}
        </p>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            className="mt-7 border-white/45 bg-transparent text-white hover:bg-white hover:text-black"
            onClick={onRetry}
            disabled={isRetrying}
          >
            {isRetrying ? "Checking" : "Try again"}
          </Button>
        ) : null}
      </section>
    </main>
  );
}
