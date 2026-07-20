import { AdminArea } from "@/components/admin/admin-area";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminArea>{children}</AdminArea>;
}
