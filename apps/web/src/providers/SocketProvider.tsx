"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import type { SaleClosedEvent } from "@restaurant/shared-types";
import { useCart, useOrders } from "@/hooks/useCart";

interface SocketContextValue {
  requestBill: () => void;
  billRequested: boolean;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext deve ser usado dentro de um SocketProvider");
  }
  return context;
}

function billRequestedKey(tableNumber: string | number) {
  return `bill_requested:${tableNumber}`;
}

function cartStorageKey(tableNumber: string | number) {
  return `cart:mesa:${tableNumber}`;
}

function ordersStorageKey(tableNumber: string | number) {
  return `orders:${tableNumber}`;
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
  const [billRequested, setBillRequested] = useState(false);

  useEffect(() => {
    setBillRequested(window.localStorage.getItem(billRequestedKey(tableNumber)) === "true");
  }, [tableNumber]);

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

      window.localStorage.removeItem(billRequestedKey(tableNumber));
      setBillRequested(false);
      clearOrders();
      clearCart();
      router.push(`/mesa/${tableNumber}?reset=true`);
    });

    // Fallback: garante que QUALQUER tablet conectado (mesmo em outra mesa)
    // limpa o localStorage da mesa que foi fechada, mesmo que ninguém estivesse
    // com a tela dessa mesa aberta no momento em que o sale:closed foi emitido
    // para a room table:{tableNumber}.
    socket.on("sale:closed:broadcast", ({ tableNumber: closedTable }: { tableNumber: number }) => {
      console.log("[Socket] sale:closed:broadcast recebido para mesa:", closedTable);

      window.localStorage.removeItem(ordersStorageKey(closedTable));
      window.localStorage.removeItem(cartStorageKey(closedTable));
      window.localStorage.removeItem(billRequestedKey(closedTable));

      if (closedTable === Number(tableNumber)) {
        setBillRequested(false);
        clearOrders();
        clearCart();
        router.push(`/mesa/${tableNumber}?reset=true`);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [tableNumber, updateOrderStatus, clearOrders, clearCart, router]);

  const requestBill = useCallback(() => {
    socketRef.current?.emit("request:bill", { tableNumber: Number(tableNumber) });
    window.localStorage.setItem(billRequestedKey(tableNumber), "true");
    setBillRequested(true);
  }, [tableNumber]);

  const value = useMemo(() => ({ requestBill, billRequested }), [requestBill, billRequested]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
