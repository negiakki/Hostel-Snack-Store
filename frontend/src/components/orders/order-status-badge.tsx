import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/admin-orders";

const statusStyles: Record<OrderStatus, string> = {
  Placed: "border-amber-200/75 bg-amber-300/15 text-amber-50",
  Ready: "border-sky-200/75 bg-sky-300/15 text-sky-50",
  Completed: "border-violet-200/75 bg-violet-300/15 text-violet-50",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap",
        statusStyles[status],
      )}
    >
      <span className="sr-only">Order status: </span>
      {status}
    </span>
  );
}
