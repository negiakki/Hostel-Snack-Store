import { apiConfig } from "@/config/api";

export interface StoreStatus {
  isOpen: boolean;
  message: string;
}

export interface UpdateStoreStatusInput {
  isOpen: boolean;
  message: string;
}

function isStoreStatus(value: unknown): value is StoreStatus {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).isOpen === "boolean" &&
    typeof (value as Record<string, unknown>).message === "string"
  );
}

function getErrorMessage(payload: unknown): string {
  if (typeof payload !== "object" || payload === null) {
    return "Unable to complete the request.";
  }

  const message = (payload as Record<string, unknown>).message;

  return typeof message === "string"
    ? message
    : "Unable to complete the request.";
}

async function request(
  path: string,
  options: RequestInit = {},
): Promise<StoreStatus> {
  const response = await fetch(apiConfig.baseUrl + path, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(payload));
  }

  if (!isStoreStatus(payload)) {
    throw new Error("The store status response was invalid.");
  }

  return payload;
}

export function getStoreStatus(signal?: AbortSignal): Promise<StoreStatus> {
  return request("/store-status", { signal });
}

export function updateStoreStatus(
  input: UpdateStoreStatusInput,
): Promise<StoreStatus> {
  return request("/store-status", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
