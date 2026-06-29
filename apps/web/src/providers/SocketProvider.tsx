"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import type { SaleClosedEvent } from "@restaurant/shared-types";
import { useCart, useOrders } from "@/hooks/useCart";

interface SocketContextValue {
  requestBill: () => void;
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
  const { updateOrderStatus, clearOrders } = useOrders(tableNumber);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket: Socket = io("http://localhost:3004");
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
      console.log("[Socket] sale:closed recebido", event);
      if (event.tableNumber !== Number(tableNumber)) return;

      clearOrders();
      clearCart();
      router.push(`/mesa/${tableNumber}?reset=true`);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [tableNumber, updateOrderStatus, clearOrders, clearCart, router]);

  const requestBill = useCallback(() => {
    socketRef.current?.emit("request:bill", { tableNumber: Number(tableNumber) });
  }, [tableNumber]);

  const value = useMemo(() => ({ requestBill }), [requestBill]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
