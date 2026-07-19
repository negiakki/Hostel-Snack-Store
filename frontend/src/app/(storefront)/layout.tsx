import { StorefrontAvailabilityGate } from "@/components/storefront/storefront-availability-gate";

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <StorefrontAvailabilityGate>{children}</StorefrontAvailabilityGate>;
}
