import type { CreatedOrder } from "@/lib/orders";

const ORDER_CONFIRMATION_KEY = "hostel-snack-store.order-confirmation";
const subscribers = new Set<() => void>();

let cachedSerializedOrder: string | null | undefined;
let cachedOrder: CreatedOrder | null = null;

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

export function saveOrderConfirmation(order: CreatedOrder): void {
  try {
    const serializedOrder = JSON.stringify(order);

    sessionStorage.setItem(ORDER_CONFIRMATION_KEY, serializedOrder);
    cachedSerializedOrder = serializedOrder;
    cachedOrder = order;
    notifySubscribers();
  } catch {
    // A successful order must still navigate even if this browser blocks session storage.
  }
}

export function getOrderConfirmation(): CreatedOrder | null {
  if (typeof window === "undefined") {
    return null;
  }

  let storedOrder: string | null;

  try {
    storedOrder = sessionStorage.getItem(ORDER_CONFIRMATION_KEY);
  } catch {
    storedOrder = null;
  }

  if (storedOrder === cachedSerializedOrder) {
    return cachedOrder;
  }

  cachedSerializedOrder = storedOrder;
  cachedOrder = parseOrder(storedOrder);

  return cachedOrder;
}

export function getOrderConfirmationServerSnapshot(): CreatedOrder | null {
  return null;
}

export function subscribeToOrderConfirmation(onStoreChange: () => void): () => void {
  subscribers.add(onStoreChange);

  function handleStorageChange(event: StorageEvent) {
    if (event.key !== ORDER_CONFIRMATION_KEY || event.storageArea !== sessionStorage) {
      return;
    }

    cachedSerializedOrder = undefined;
    onStoreChange();
  }

  window.addEventListener("storage", handleStorageChange);

  return () => {
    subscribers.delete(onStoreChange);
    window.removeEventListener("storage", handleStorageChange);
  };
}

function parseOrder(storedOrder: string | null): CreatedOrder | null {
  if (!storedOrder) {
    return null;
  }

  try {
    const order: unknown = JSON.parse(storedOrder);
    return isCreatedOrder(order) ? order : null;
  } catch {
    return null;
  }
}

export function clearOrderConfirmation(): void {
  try {
    sessionStorage.removeItem(ORDER_CONFIRMATION_KEY);
    cachedSerializedOrder = null;
    cachedOrder = null;
    notifySubscribers();
  } catch {
    // The order remains confirmed even when this browser blocks session storage.
  }
}

function notifySubscribers(): void {
  subscribers.forEach((subscriber) => subscriber());
}
