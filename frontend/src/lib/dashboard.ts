import { apiConfig } from "@/config/api";
import { adminFetch } from "@/lib/admin-api";
import type { OrderStatus } from "@/lib/admin-orders";

export interface DashboardData {
  summary: {
    ordersToday: number;
    revenueToday: number;
    profitToday: number;
    storeStatus: "Open" | "Closed";
  };
  activeOrders: {
    placed: number;
    ready: number;
  };
  inventoryAlerts: {
    lowStock: DashboardInventoryAlert[];
    outOfStock: DashboardInventoryAlert[];
  };
  recentActiveOrders: DashboardRecentOrder[];
}

interface DashboardInventoryAlert {
  productId: string;
  name: string;
  stock: number;
}

interface DashboardRecentOrder {
  orderId: string;
  customerName: string;
  status: Extract<OrderStatus, "Placed" | "Ready">;
  createdAt: string;
}

interface ApiErrorResponse {
  success: false;
  message: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isInventoryAlert(value: unknown): value is DashboardInventoryAlert {
  return (
    isRecord(value) &&
    typeof value.productId === "string" &&
    typeof value.name === "string" &&
    typeof value.stock === "number"
  );
}

function isRecentOrder(value: unknown): value is DashboardRecentOrder {
  return (
    isRecord(value) &&
    typeof value.orderId === "string" &&
    typeof value.customerName === "string" &&
    (value.status === "Placed" || value.status === "Ready") &&
    typeof value.createdAt === "string"
  );
}

function isDashboardData(value: unknown): value is DashboardData {
  if (
    !isRecord(value) ||
    !isRecord(value.summary) ||
    !isRecord(value.activeOrders) ||
    !isRecord(value.inventoryAlerts)
  ) {
    return false;
  }

  return (
    typeof value.summary.ordersToday === "number" &&
    typeof value.summary.revenueToday === "number" &&
    typeof value.summary.profitToday === "number" &&
    (value.summary.storeStatus === "Open" ||
      value.summary.storeStatus === "Closed") &&
    typeof value.activeOrders.placed === "number" &&
    typeof value.activeOrders.ready === "number" &&
    Array.isArray(value.inventoryAlerts.lowStock) &&
    value.inventoryAlerts.lowStock.every(isInventoryAlert) &&
    Array.isArray(value.inventoryAlerts.outOfStock) &&
    value.inventoryAlerts.outOfStock.every(isInventoryAlert) &&
    Array.isArray(value.recentActiveOrders) &&
    value.recentActiveOrders.every(isRecentOrder)
  );
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    isRecord(value) &&
    value.success === false &&
    typeof value.message === "string"
  );
}

export async function getDashboard(
  signal?: AbortSignal,
): Promise<DashboardData> {
  let response: Response;

  try {
    response = await adminFetch(`${apiConfig.baseUrl}/dashboard`, {
      cache: "no-store",
      signal,
    });
  } catch {
    throw new Error(
      "We could not reach the server. Check your connection and try again.",
    );
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      isApiErrorResponse(payload)
        ? payload.message
        : "The dashboard could not be loaded. Please try again.",
    );
  }

  if (
    !isRecord(payload) ||
    payload.success !== true ||
    !isDashboardData(payload.data)
  ) {
    throw new Error(
      "We received an invalid dashboard response. Please try again.",
    );
  }

  return payload.data;
}
