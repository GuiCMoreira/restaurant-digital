"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import type { SaleClosedEvent } from "@restaurant/shared-types";
import { useCart } from "@/hooks/useCart";
import { useOrders, type Order } from "@/hooks/useOrders";

const SALE_SERVICE_URL =
  process.env.NEXT_PUBLIC_SALE_SERVICE_URL ?? "http://localhost:3003";
const NOTIFICATION_SERVICE_URL =
  process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL ?? "http://localhost:3004";

interface SocketContextValue {
  orders: Order[];
  totalAllOrders: number;
  fetchOrders: () => Promise<void>;
  requestBill: () => Promise<void>;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext deve ser usado dentro de um SocketProvider");
  }
  return context;
}

interface SocketProviderProps {
  tableNumber: string;
  children: React.ReactNode;
}

export function SocketProvider({ tableNumber, children }: SocketProviderProps) {
  const router = useRouter();
  const { clearCart } = useCart(tableNumber);
  const { orders, fetchOrders, updateOrderStatus, totalAllOrders } = useOrders(tableNumber);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket: Socket = io(NOTIFICATION_SERVICE_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket] conectado, entrando na room table:", tableNumber);
      socket.emit("join:table", { tableNumber: Number(tableNumber) });
    });

    socket.on("order:preparing", (event: { orderId: string }) => {
      updateOrderStatus(event.orderId, "preparing");
    });

    socket.on("order:ready", (event: { orderId: string }) => {
      updateOrderStatus(event.orderId, "ready");
    });

    socket.on("sale:closed", (event: SaleClosedEvent) => {
      if (event.tableNumber !== Number(tableNumber)) return;
      fetchOrders();
      clearCart();
      router.push(`/mesa/${tableNumber}?reset=true`);
    });

    // Fallback: any connected client clears the cart for the closed table,
    // even if they were viewing a different table at the time.
    socket.on("sale:closed:broadcast", ({ tableNumber: closedTable }: { tableNumber: number }) => {
      window.localStorage.removeItem(`cart:mesa:${closedTable}`);
      if (closedTable === Number(tableNumber)) {
        fetchOrders();
        clearCart();
        router.push(`/mesa/${tableNumber}?reset=true`);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [tableNumber, fetchOrders, updateOrderStatus, clearCart, router]);

  const requestBill = useCallback(async () => {
    await fetch(
      `${SALE_SERVICE_URL}/sales/table/${tableNumber}/request-bill`,
      { method: "POST" }
    );
    socketRef.current?.emit("request:bill", { tableNumber: Number(tableNumber) });
  }, [tableNumber]);

  const value = useMemo(
    () => ({ orders, totalAllOrders, fetchOrders, requestBill }),
    [orders, totalAllOrders, fetchOrders, requestBill]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}
