import { apiConfig } from "@/config/api";

export interface InventoryProduct {
  id: string;
  productId: string;
  name: string;
  category: string;
  sellingPrice: number;
  stock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export type StockOperation = "add" | "remove" | "set";

interface InventoryProductsResponse {
  success: true;
  data: InventoryProduct[];
}

interface InventoryResponse {
  success: true;
  data: {
    productId: string;
    stock: number;
    lowStockThreshold: number;
    isLowStock: boolean;
    isOutOfStock: boolean;
  };
}

interface ApiErrorResponse {
  success: false;
  message: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApiError(value: unknown): value is ApiErrorResponse {
  return (
    isRecord(value) &&
    value.success === false &&
    typeof value.message === "string"
  );
}

function isInventoryProduct(value: unknown): value is InventoryProduct {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.productId === "string" &&
    typeof value.name === "string" &&
    typeof value.category === "string" &&
    typeof value.sellingPrice === "number" &&
    typeof value.stock === "number" &&
    typeof value.lowStockThreshold === "number" &&
    typeof value.isLowStock === "boolean" &&
    typeof value.isOutOfStock === "boolean"
  );
}

function isInventoryProductsResponse(
  value: unknown,
): value is InventoryProductsResponse {
  return (
    isRecord(value) &&
    value.success === true &&
    Array.isArray(value.data) &&
    value.data.every(isInventoryProduct)
  );
}

function isInventoryResponse(value: unknown): value is InventoryResponse {
  if (!isRecord(value) || value.success !== true || !isRecord(value.data)) {
    return false;
  }

  const data = value.data;

  return (
    typeof data.productId === "string" &&
    typeof data.stock === "number" &&
    typeof data.lowStockThreshold === "number" &&
    typeof data.isLowStock === "boolean" &&
    typeof data.isOutOfStock === "boolean"
  );
}

async function request(
  path: string,
  options: RequestInit = {},
): Promise<unknown> {
  const response = await fetch(apiConfig.baseUrl + path, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new Error("The inventory service returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      isApiError(payload) ? payload.message : "Unable to complete the request.",
    );
  }

  return payload;
}

export async function getInventoryProducts(
  signal?: AbortSignal,
): Promise<InventoryProduct[]> {
  const response = await request("/inventory/products", { signal });

  if (!isInventoryProductsResponse(response)) {
    throw new Error("The inventory service returned an invalid response.");
  }

  return response.data;
}

export async function adjustStock(
  productId: string,
  operation: StockOperation,
  value: number,
): Promise<InventoryResponse["data"]> {
  const isSetOperation = operation === "set";
  const path = isSetOperation
    ? `/inventory/products/${productId}/stock`
    : `/inventory/products/${productId}/${operation}-stock`;
  const response = await request(path, {
    method: isSetOperation ? "PUT" : "POST",
    body: JSON.stringify(
      isSetOperation ? { stock: value } : { quantity: value },
    ),
  });

  if (!isInventoryResponse(response)) {
    throw new Error("The inventory service returned an invalid response.");
  }

  return response.data;
}
