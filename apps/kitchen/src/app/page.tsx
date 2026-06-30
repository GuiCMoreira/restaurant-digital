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
import { KitchenOrder, KitchenOrderStatus } from "@/types/order";

interface QueueRecord {
  orderId: string;
  tableNumber: number;
  items: Array<{ name: string; quantity: number }>;
  status: KitchenOrderStatus;
  updatedAt: string;
}

const MAX_VISIBLE_READY = 20;

const KITCHEN_SERVICE_URL =
  process.env.NEXT_PUBLIC_KITCHEN_SERVICE_URL ?? "http://localhost:3002";
const NOTIFICATION_SERVICE_URL =
  process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL ?? "http://localhost:3004";

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [connected, setConnected] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const knownIds = useRef(new Set<string>());

  useEffect(() => {
    async function loadQueue() {
      try {
        const response = await fetch(`${KITCHEN_SERVICE_URL}/kitchen/queue`);
        if (!response.ok) return;
        const data: QueueRecord[] = await response.json();

        setOrders(
          data.map((record) => {
            knownIds.current.add(record.orderId);
            return {
              orderId: record.orderId,
              tableNumber: record.tableNumber,
              items: record.items,
              status: record.status,
              createdAt: record.updatedAt,
              updatedAt: record.updatedAt,
            };
          })
        );
      } catch {
        // backend indisponível — a fila inicial fica vazia até a próxima atualização via WebSocket
      }
    }

    loadQueue();
  }, []);

  useEffect(() => {
    const socket: Socket = io(NOTIFICATION_SERVICE_URL);

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join:kitchen");
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("order:new", (event: KitchenQueuedEvent) => {
      if (knownIds.current.has(event.orderId)) return;
      knownIds.current.add(event.orderId);

      const now = new Date().toISOString();
      setOrders((current) => [
        ...current,
        {
          orderId: event.orderId,
          tableNumber: event.tableNumber,
          items: event.items,
          status: "pending",
          createdAt: now,
          updatedAt: now,
        },
      ]);
    });

    socket.on("order:status_updated", (event: KitchenStatusUpdatedEvent) => {
      setOrders((current) =>
        current.map((order) =>
          order.orderId === event.orderId
            ? { ...order, status: event.status, updatedAt: event.updatedAt }
            : order
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Conecta diretamente ao gateway do kitchen-service para refletir, em todas as
  // telas abertas, a remoção de pedidos finalizados feita por qualquer dispositivo.
  useEffect(() => {
    const queueSocket: Socket = io(`${KITCHEN_SERVICE_URL}/kitchen`);

    queueSocket.on("queue:updated", (queue: QueueRecord[]) => {
      setOrders((current) => {
        const previousById = new Map(current.map((order) => [order.orderId, order]));

        return queue.map((record) => {
          knownIds.current.add(record.orderId);
          const previous = previousById.get(record.orderId);

          return {
            orderId: record.orderId,
            tableNumber: record.tableNumber,
            items: record.items,
            status: record.status,
            createdAt: previous?.createdAt ?? record.updatedAt,
            updatedAt: record.updatedAt,
          };
        });
      });
    });

    return () => {
      queueSocket.disconnect();
    };
  }, []);

  const updateStatus = useCallback(async (orderId: string, status: "preparing" | "ready") => {
    setUpdatingId(orderId);
    try {
      await fetch(`${KITCHEN_SERVICE_URL}/kitchen/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setOrders((current) =>
        current.map((order) =>
          order.orderId === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order
        )
      );
    } finally {
      setUpdatingId(null);
    }
  }, []);

  const handleStartPreparing = useCallback(
    (orderId: string) => updateStatus(orderId, "preparing"),
    [updateStatus]
  );
  const handleMarkReady = useCallback(
    (orderId: string) => updateStatus(orderId, "ready"),
    [updateStatus]
  );

  const received = orders
    .filter((order) => order.status === "pending")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const preparing = orders
    .filter((order) => order.status === "preparing")
    .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());

  const ready = orders
    .filter((order) => order.status === "ready")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const visibleReady = ready.slice(0, MAX_VISIBLE_READY);
  const hiddenReadyCount = ready.length - visibleReady.length;

  const handleClearFinished = useCallback(async () => {
    if (ready.length === 0) return;
    const confirmed = window.confirm(`Limpar ${ready.length} pedidos finalizados?`);
    if (!confirmed) return;

    setClearing(true);
    try {
      await fetch(`${KITCHEN_SERVICE_URL}/kitchen/queue/finished`, {
        method: "DELETE",
      });
      setOrders((current) => current.filter((order) => order.status !== "ready"));
    } finally {
      setClearing(false);
    }
  }, [ready.length]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-forest">
      <Header
        connected={connected}
        receivedCount={received.length}
        preparingCount={preparing.length}
        readyCount={ready.length}
      />

      <main className="stagger-list grid flex-1 grid-cols-1 gap-4 overflow-hidden px-6 py-6 md:grid-cols-3">
        <section
          className="animate-fade-in flex flex-col overflow-hidden rounded-xl p-4"
          style={{ backgroundColor: "#FEF9C3" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-forest">Recebidos</h2>
            <span className="text-sm font-medium text-muted">{received.length}</span>
          </div>

          <div className="stagger-list flex flex-1 flex-col gap-3 overflow-y-auto">
            {received.length === 0 ? (
              <EmptyState message="Nenhum pedido novo" />
            ) : (
              received.map((order) => (
                <OrderCard
                  key={order.orderId}
                  order={order}
                  column="received"
                  onAction={handleStartPreparing}
                  updating={updatingId === order.orderId}
                />
              ))
            )}
          </div>
        </section>

        <section
          className="animate-fade-in flex flex-col overflow-hidden rounded-xl p-4"
          style={{ backgroundColor: "#DBEAFE" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-forest">Em preparo</h2>
            <span className="text-sm font-medium text-muted">{preparing.length}</span>
          </div>

          <div className="stagger-list flex flex-1 flex-col gap-3 overflow-y-auto">
            {preparing.length === 0 ? (
              <EmptyState message="Nenhum pedido em preparo" />
            ) : (
              preparing.map((order) => (
                <OrderCard
                  key={order.orderId}
                  order={order}
                  column="preparing"
                  onAction={handleMarkReady}
                  updating={updatingId === order.orderId}
                />
              ))
            )}
          </div>
        </section>

        <section
          className="animate-fade-in flex flex-col overflow-hidden rounded-xl p-4"
          style={{ backgroundColor: "#D8F3DC" }}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-bold text-forest">Finalizados</h2>
              <span className="text-sm font-medium text-muted">{ready.length}</span>
            </div>
            {ready.length > 0 && (
              <button
                type="button"
                onClick={handleClearFinished}
                disabled={clearing}
                className="text-xs font-medium text-muted hover:underline disabled:opacity-60"
              >
                {clearing ? "Limpando..." : "Limpar lista"}
              </button>
            )}
          </div>

          <div className="stagger-list flex flex-1 flex-col gap-3 overflow-y-auto">
            {ready.length === 0 ? (
              <EmptyState message="Nenhum pedido finalizado" />
            ) : (
              <>
                {visibleReady.map((order) => (
                  <OrderCard key={order.orderId} order={order} column="ready" />
                ))}
                {hiddenReadyCount > 0 && (
                  <p className="py-2 text-center text-xs text-muted">
                    + {hiddenReadyCount} pedidos finalizados anteriores
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
