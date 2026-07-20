"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminSession, loginAdmin } from "@/lib/auth";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    async function checkSession() {
      try {
        await getAdminSession();
        router.replace("/admin");
      } catch {
        if (isCurrent) {
          setIsCheckingSession(false);
        }
      }
    }

    void checkSession();

    return () => {
      isCurrent = false;
    };
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!emailPattern.test(normalizedEmail) || !password) {
      setError("Enter a valid email address and password.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await loginAdmin(normalizedEmail, password);
      router.replace("/admin");
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to sign in.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (isCheckingSession) {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-canvas-light px-6 text-black">
        <p className="text-sm text-zinc-600">Checking your admin session…</p>
      </main>
    );
  }

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-canvas-light px-4 py-8 text-black">
      <section
        aria-labelledby="admin-login-title"
        className="w-full max-w-md rounded-xl border border-hairline-light bg-white p-6 sm:p-8"
      >
        <p className="text-sm text-zinc-600">Hostel Snack Store</p>
        <h1 id="admin-login-title" className="mt-2 text-3xl font-semibold tracking-tight">
          Admin sign in
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Sign in to manage tonight&apos;s store.
        </p>

        <form className="mt-7 grid gap-5" onSubmit={(event) => void handleSubmit(event)}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading}
              aria-invalid={error ? true : undefined}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
              aria-invalid={error ? true : undefined}
              required
            />
          </div>

          {error ? (
            <p className="text-sm leading-6 text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
            {isLoading ? "Signing in" : "Sign in"}
          </Button>
        </form>
      </section>
    </main>
  );
}
