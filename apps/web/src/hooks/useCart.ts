"use client";

import { useCallback, useEffect, useState } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
}

function storageKey(tableNumber: string | number) {
  return `cart:mesa:${tableNumber}`;
}

function readCart(tableNumber: string | number): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(tableNumber));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const CART_EVENT = "cart-updated";

export function useCart(tableNumber: string | number) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart(tableNumber));

    const handleUpdate = () => setItems(readCart(tableNumber));
    window.addEventListener(CART_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(CART_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [tableNumber]);

  const persist = useCallback(
    (next: CartItem[]) => {
      setItems(next);
      window.localStorage.setItem(storageKey(tableNumber), JSON.stringify(next));
      window.dispatchEvent(new Event(CART_EVENT));
    },
    [tableNumber]
  );

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">) => {
      const current = readCart(tableNumber);
      const existing = current.find((i) => i.id === item.id);
      const next = existing
        ? current.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...current, { ...item, quantity: 1 }];
      persist(next);
    },
    [tableNumber, persist]
  );

  const removeItem = useCallback(
    (id: string) => {
      const current = readCart(tableNumber);
      persist(current.filter((i) => i.id !== id));
    },
    [tableNumber, persist]
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      const current = readCart(tableNumber);
      if (quantity <= 0) {
        persist(current.filter((i) => i.id !== id));
        return;
      }
      persist(current.map((i) => (i.id === id ? { ...i, quantity } : i)));
    },
    [tableNumber, persist]
  );

  const clearCart = useCallback(() => {
    persist([]);
  }, [persist]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, addItem, removeItem, updateQuantity, clearCart, total, totalItems };
}
