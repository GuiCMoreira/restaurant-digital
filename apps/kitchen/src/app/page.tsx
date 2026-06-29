"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type {
  KitchenQueuedEvent,
  KitchenStatusUpdatedEvent,
} from "@restaurant/shared-types";
import Header from "@/components/Header";
import OrderCard from "@/components/OrderCard";
import EmptyState from "@/components/EmptyState";
import { KitchenOrder } from "@/types/order";

interface QueueRecord {
  orderId: string;
  tableNumber: number;
  items: Array<{ name: string; quantity: number }>;
  status: "preparing" | "ready";
  updatedAt: string;
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [connected, setConnected] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const knownIds = useRef(new Set<string>());

  useEffect(() => {
    async function loadQueue() {
      try {
        const response = await fetch("http://localhost:3002/kitchen/queue");
        if (!response.ok) return;
        const data: QueueRecord[] = await response.json();

        setOrders(
          data
            .map((record) => {
              knownIds.current.add(record.orderId);
              return {
                orderId: record.orderId,
                tableNumber: record.tableNumber,
                items: record.items,
                status: record.status,
                createdAt: record.updatedAt,
              };
            })
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        );
      } catch {
        // backend indisponível — a fila inicial fica vazia até a próxima atualização via WebSocket
      }
    }

    loadQueue();
  }, []);

  useEffect(() => {
    const socket: Socket = io("http://localhost:3004");

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join:kitchen");
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("order:new", (event: KitchenQueuedEvent) => {
      if (knownIds.current.has(event.orderId)) return;
      knownIds.current.add(event.orderId);

      setOrders((current) => [
        ...current,
        {
          orderId: event.orderId,
          tableNumber: event.tableNumber,
          items: event.items,
          status: "preparing",
          createdAt: new Date().toISOString(),
        },
      ]);
    });

    socket.on("order:status_updated", (event: KitchenStatusUpdatedEvent) => {
      setOrders((current) =>
        current.map((order) =>
          order.orderId === event.orderId ? { ...order, status: event.status } : order
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleMarkReady = useCallback(async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      await fetch(`http://localhost:3002/kitchen/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ready" }),
      });
      setOrders((current) =>
        current.map((order) => (order.orderId === orderId ? { ...order, status: "ready" } : order))
      );
    } finally {
      setUpdatingId(null);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-forest">
      <Header connected={connected} activeCount={orders.length} />

      <main className="flex flex-1 flex-col px-6 py-6">
        {orders.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                onMarkReady={handleMarkReady}
                updating={updatingId === order.orderId}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
