"use client";

import { useCallback, useEffect, useState } from "react";

export type OrderStatus = "pending" | "preparing" | "ready";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  emoji?: string;
}

export interface Order {
  orderId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

const ORDER_SERVICE_URL =
  process.env.NEXT_PUBLIC_ORDER_SERVICE_URL ?? "http://localhost:3001";

interface BackendOrder {
  id: string;
  table_number: number;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  created_at: string;
}

function mapOrder(o: BackendOrder): Order {
  return {
    orderId: o.id,
    items: o.items,
    total: o.total_amount,
    status: o.status,
    createdAt: o.created_at,
  };
}

export function useOrders(tableNumber: string | number) {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(
        `${ORDER_SERVICE_URL}/orders/table/${tableNumber}`
      );
      if (!res.ok) return;
      const data: BackendOrder[] = await res.json();
      setOrders(data.map(mapOrder));
    } catch {
      // service unavailable — keep current state
    }
  }, [tableNumber]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10_000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status } : o))
      );
    },
    []
  );

  const totalAllOrders = orders.reduce((sum, o) => sum + o.total, 0);

  return { orders, fetchOrders, updateOrderStatus, totalAllOrders };
}
