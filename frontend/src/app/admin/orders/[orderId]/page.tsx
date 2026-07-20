import { OrderDetailsPage } from "@/components/orders/order-details-page";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return <OrderDetailsPage orderId={orderId} />;
}
