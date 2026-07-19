"use client";

import { CustomerStorefrontHeader } from "@/components/storefront/customer-storefront-header";
import { StorefrontAvailabilityScreen } from "@/components/storefront/storefront-availability-screen";
import { useStoreStatus } from "@/hooks/use-store-status";

interface StorefrontAvailabilityGateProps {
  children: React.ReactNode;
}

export function StorefrontAvailabilityGate({
  children,
}: StorefrontAvailabilityGateProps) {
  const { storeStatus, isLoading, error, refresh } = useStoreStatus();

  if (isLoading) {
    return <StorefrontAvailabilityScreen state="loading" />;
  }

  if (error || !storeStatus) {
    return (
      <StorefrontAvailabilityScreen
        state="unavailable"
        message={error || undefined}
        onRetry={() => void refresh()}
      />
    );
  }

  if (!storeStatus.isOpen) {
    return (
      <StorefrontAvailabilityScreen
        state="closed"
        message={storeStatus.message || undefined}
        onRetry={() => void refresh()}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] bg-canvas-night text-white">
      <CustomerStorefrontHeader />
      {children}
    </div>
  );
}
