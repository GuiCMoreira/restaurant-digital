"use client";

import { useCallback, useEffect, useState } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
}

export type OrderStatus = "pending" | "preparing" | "ready";

export interface Order {
  orderId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

function cartStorageKey(tableNumber: string | number) {
  return `cart:mesa:${tableNumber}`;
}

function ordersStorageKey(tableNumber: string | number) {
  return `orders:${tableNumber}`;
}

function readCart(tableNumber: string | number): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(cartStorageKey(tableNumber));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function readOrders(tableNumber: string | number): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ordersStorageKey(tableNumber));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const CART_EVENT = "cart-updated";
const ORDERS_EVENT = "orders-updated";

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
      window.localStorage.setItem(cartStorageKey(tableNumber), JSON.stringify(next));
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

export function useOrders(tableNumber: string | number) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(readOrders(tableNumber));

    const handleUpdate = () => setOrders(readOrders(tableNumber));
    window.addEventListener(ORDERS_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(ORDERS_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [tableNumber]);

  const persistOrders = useCallback(
    (next: Order[]) => {
      setOrders(next);
      window.localStorage.setItem(ordersStorageKey(tableNumber), JSON.stringify(next));
      window.dispatchEvent(new Event(ORDERS_EVENT));
    },
    [tableNumber]
  );

  const addOrder = useCallback(
    (order: Order) => {
      const current = readOrders(tableNumber);
      persistOrders([...current, order]);
    },
    [tableNumber, persistOrders]
  );

  const getOrders = useCallback(() => readOrders(tableNumber), [tableNumber]);

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      const current = readOrders(tableNumber);
      persistOrders(current.map((order) => (order.orderId === orderId ? { ...order, status } : order)));
    },
    [tableNumber, persistOrders]
  );

  const clearOrders = useCallback(() => {
    persistOrders([]);
  }, [persistOrders]);

  const totalAllOrders = orders.reduce((sum, order) => sum + order.total, 0);

  return { orders, addOrder, getOrders, updateOrderStatus, clearOrders, totalAllOrders };
}
