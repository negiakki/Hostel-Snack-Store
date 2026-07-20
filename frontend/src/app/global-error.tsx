"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  unstable_retry,
}: Readonly<{
  error: Error & { digest?: string };
  unstable_retry: () => void;
}>) {
  useEffect(() => {
    document.title = "Something went wrong | Hostel Snack Store";
  }, []);

  return (
    <html lang="en">
      <body className="grid min-h-[100dvh] place-items-center bg-white px-4 py-8 text-black">
        <main className="w-full max-w-lg rounded-xl border border-hairline-light bg-white p-6 sm:p-8">
          <p className="text-sm text-zinc-600">Hostel Snack Store</p>
          <h1 className="mt-2 text-3xl font-light tracking-tight">
            Something went wrong
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            The page could not be displayed. Your current order and store data
            have not been changed.
          </p>
          <Button type="button" className="mt-7" onClick={unstable_retry}>
            Try again
          </Button>
        </main>
      </body>
    </html>
  );
}
