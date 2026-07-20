"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ADMIN_SESSION_EXPIRED_EVENT } from "@/lib/admin-api";
import { getAdminSession, logoutAdmin, type AdminUser } from "@/lib/auth";

interface AdminSessionContextValue {
  admin: AdminUser;
  logout: () => Promise<void>;
}

const AdminSessionContext = createContext<AdminSessionContextValue | null>(
  null,
);

export function useAdminSession(): AdminSessionContextValue {
  const value = useContext(AdminSessionContext);

  if (!value) {
    throw new Error("useAdminSession must be used inside AdminSessionGate.");
  }

  return value;
}

export function AdminSessionGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const redirectToLogin = useCallback(() => {
    setAdmin(null);
    router.replace("/admin/login");
  }, [router]);

  useEffect(() => {
    let isCurrent = true;

    async function verifySession() {
      try {
        const session = await getAdminSession();

        if (isCurrent) {
          setAdmin(session);
        }
      } catch {
        if (isCurrent) {
          redirectToLogin();
        }
      } finally {
        if (isCurrent) {
          setIsChecking(false);
        }
      }
    }

    void verifySession();

    return () => {
      isCurrent = false;
    };
  }, [redirectToLogin]);

  useEffect(() => {
    window.addEventListener(ADMIN_SESSION_EXPIRED_EVENT, redirectToLogin);

    return () =>
      window.removeEventListener(ADMIN_SESSION_EXPIRED_EVENT, redirectToLogin);
  }, [redirectToLogin]);

  const logout = useCallback(async () => {
    try {
      await logoutAdmin();
    } finally {
      setAdmin(null);
      window.history.replaceState(null, "", "/admin/login");
      router.replace("/admin/login");
    }
  }, [router]);

  const value = useMemo(
    () => (admin ? { admin, logout } : null),
    [admin, logout],
  );

  if (isChecking || !value) {
    return (
      <main
        className="grid min-h-[100dvh] place-items-center bg-canvas-night px-6 text-white"
        aria-live="polite"
      >
        <p className="text-sm text-zinc-300">Checking your admin session…</p>
      </main>
    );
  }

  return (
    <AdminSessionContext.Provider value={value}>
      {children}
    </AdminSessionContext.Provider>
  );
}
