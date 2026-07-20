import { apiConfig } from "@/config/api";

export interface CreateOrderInput {
  customerName: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface CreatedOrder {
  orderId: string;
  status: string;
  total: number;
  createdAt: string;
}

interface CreateOrderResponse {
  success: true;
  data: CreatedOrder;
}

interface ApiErrorResponse {
  success: false;
  message: string;
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as Record<string, unknown>).success === false &&
    typeof (value as Record<string, unknown>).message === "string"
  );
}

function isCreatedOrder(value: unknown): value is CreatedOrder {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const order = value as Record<string, unknown>;

  return (
    typeof order.orderId === "string" &&
    typeof order.status === "string" &&
    typeof order.total === "number" &&
    typeof order.createdAt === "string"
  );
}

function isCreateOrderResponse(value: unknown): value is CreateOrderResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as Record<string, unknown>).success === true &&
    isCreatedOrder((value as Record<string, unknown>).data)
  );
}

export async function createOrder(input: CreateOrderInput): Promise<CreatedOrder> {
  let response: Response;

  try {
    response = await fetch(`${apiConfig.baseUrl}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error(
      "We could not reach the store. Check your connection and try again.",
    );
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      isApiErrorResponse(payload)
        ? payload.message
        : "We could not place your order. Please try again.",
    );
  }

  if (!isCreateOrderResponse(payload)) {
    throw new Error("We received an invalid order confirmation. Please try again.");
  }

  return payload.data;
}
