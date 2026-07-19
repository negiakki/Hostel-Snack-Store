"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import type { Product } from "@/lib/products";

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (product: Product) => void;
  incrementItem: (productId: string) => void;
  decrementItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

type CartAction =
  | { type: "add"; product: Product }
  | { type: "increment"; productId: string }
  | { type: "decrement"; productId: string }
  | { type: "remove"; productId: string }
  | { type: "clear" };

const CartContext = createContext<CartContextValue | null>(null);

interface CartToast {
  message: string;
}

function cartReducer(items: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "add": {
      if (action.product.stock <= 0) {
        return items;
      }

      const existingItem = items.find((item) => item.id === action.product.id);

      if (!existingItem) {
        return [...items, { ...action.product, quantity: 1 }];
      }

      if (existingItem.quantity >= action.product.stock) {
        return items;
      }

      return items.map((item) =>
        item.id === action.product.id
          ? { ...item, ...action.product, quantity: item.quantity + 1 }
          : item,
      );
    }

    case "increment":
      return items.map((item) =>
        item.id === action.productId && item.quantity < item.stock
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );

    case "decrement":
      return items.flatMap((item) => {
        if (item.id !== action.productId) {
          return [item];
        }

        return item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [];
      });

    case "remove":
      return items.filter((item) => item.id !== action.productId);

    case "clear":
      return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const [toast, setToast] = useState<CartToast | null>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemCount = useMemo(
    () => items.reduce((count, item) => count + item.quantity, 0),
    [items],
  );
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0),
    [items],
  );
  useEffect(
    () => () => {
      if (toastTimeout.current) {
        clearTimeout(toastTimeout.current);
      }
    },
    [],
  );
  const addItem = useCallback((product: Product) => {
    const existingItem = items.find((item) => item.id === product.id);

    if (
      product.stock <= 0 ||
      (existingItem && existingItem.quantity >= product.stock)
    ) {
      return;
    }

    dispatch({ type: "add", product });

    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current);
    }

    setToast({
      message: existingItem
        ? `${product.name} quantity increased.`
        : `${product.name} added to cart.`,
    });
    toastTimeout.current = setTimeout(() => setToast(null), 3000);
  }, [items]);
  const incrementItem = useCallback((productId: string) => {
    dispatch({ type: "increment", productId });
  }, []);
  const decrementItem = useCallback((productId: string) => {
    dispatch({ type: "decrement", productId });
  }, []);
  const removeItem = useCallback((productId: string) => {
    dispatch({ type: "remove", productId });
  }, []);
  const clearCart = useCallback(() => {
    dispatch({ type: "clear" });
  }, []);
  const value = useMemo(
    () => ({
      items,
      itemCount,
      total,
      addItem,
      incrementItem,
      decrementItem,
      removeItem,
      clearCart,
    }),
    [
      addItem,
      clearCart,
      decrementItem,
      incrementItem,
      itemCount,
      items,
      removeItem,
      total,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast ? (
        <div
          className="fixed right-4 bottom-4 z-50 max-w-sm rounded-xl border border-white/35 bg-canvas-night-elevated px-4 py-3 text-sm leading-6 text-white shadow-lg"
          role="status"
        >
          {toast.message}
        </div>
      ) : null}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }

  return context;
}
