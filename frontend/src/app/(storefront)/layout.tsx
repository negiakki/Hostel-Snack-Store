import { CartProvider } from "@/components/storefront/cart-provider";
import { StorefrontAvailabilityGate } from "@/components/storefront/storefront-availability-gate";

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <StorefrontAvailabilityGate>{children}</StorefrontAvailabilityGate>
    </CartProvider>
  );
}
