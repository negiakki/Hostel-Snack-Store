"use client";

import { usePathname } from "next/navigation";

import { AdminSessionGate } from "@/components/admin/admin-session-gate";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminArea({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return children;
  }

  return (
    <AdminSessionGate>
      <div className="flex min-h-[100dvh] flex-col bg-background md:flex-row">
        <AdminSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </AdminSessionGate>
  );
}
