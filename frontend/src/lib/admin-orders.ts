import { adminFetch } from "@/lib/admin-api";
import { apiConfig } from "@/config/api";

export type OrderStatus = "Placed" | "Ready" | "Completed";

export interface AdminOrderSummary {
  orderId: string;
  customerName: string;
  itemCount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface AdminOrderDetail {
  orderId: string;
  customerName: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}

interface ApiErrorResponse {
  success: false;
  message: string;
}

function isOrderStatus(value: unknown): value is OrderStatus {
  return value === "Placed" || value === "Ready" || value === "Completed";
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as Record<string, unknown>).success === false &&
    typeof (value as Record<string, unknown>).message === "string"
  );
}

function isOrderSummary(value: unknown): value is AdminOrderSummary {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const order = value as Record<string, unknown>;

  return (
    typeof order.orderId === "string" &&
    typeof order.customerName === "string" &&
    typeof order.itemCount === "number" &&
    typeof order.total === "number" &&
    isOrderStatus(order.status) &&
    typeof order.createdAt === "string"
  );
}

function isOrderDetail(value: unknown): value is AdminOrderDetail {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const order = value as Record<string, unknown>;

  return (
    typeof order.orderId === "string" &&
    typeof order.customerName === "string" &&
    typeof order.total === "number" &&
    isOrderStatus(order.status) &&
    typeof order.createdAt === "string" &&
    Array.isArray(order.items) &&
    order.items.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Record<string, unknown>).productName === "string" &&
        typeof (item as Record<string, unknown>).quantity === "number" &&
        typeof (item as Record<string, unknown>).unitPrice === "number" &&
        typeof (item as Record<string, unknown>).lineTotal === "number",
    )
  );
}

function isSuccessResponse<T>(
  value: unknown,
  isData: (data: unknown) => data is T,
): value is { success: true; data: T } {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as Record<string, unknown>).success === true &&
    isData((value as Record<string, unknown>).data)
  );
}

async function request<T>(
  path: string,
  init: RequestInit,
  isData: (data: unknown) => data is T,
): Promise<T> {
  let response: Response;

  try {
    response = await adminFetch(`${apiConfig.baseUrl}${path}`, init);
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
        : "The order request failed. Please try again.",
    );
  }

  if (!isSuccessResponse(payload, isData)) {
    throw new Error("We received an invalid order response. Please try again.");
  }

  return payload.data;
}

export function getAdminOrders(): Promise<AdminOrderSummary[]> {
  return request(
    "/orders",
    { cache: "no-store" },
    (value): value is AdminOrderSummary[] =>
      Array.isArray(value) && value.every(isOrderSummary),
  );
}

export function getAdminOrder(orderId: string): Promise<AdminOrderDetail> {
  return request(
    `/orders/${encodeURIComponent(orderId)}`,
    { cache: "no-store" },
    isOrderDetail,
  );
}

export function updateAdminOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<AdminOrderDetail> {
  return request(
    `/orders/${encodeURIComponent(orderId)}/status`,
    {
      method: "PATCH",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
    isOrderDetail,
  );
}
