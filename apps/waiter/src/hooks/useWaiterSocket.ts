"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { SaleClosedEvent } from "@restaurant/shared-types";

interface NewSaleEvent {
  tableNumber: number;
}

interface BillRequestedEvent {
  tableNumber: number;
  requestedAt: string;
}

interface UseWaiterSocketOptions {
  onSaleClosed?: (event: SaleClosedEvent) => void;
  onNewSale?: (event: NewSaleEvent) => void;
  onBillRequested?: (event: BillRequestedEvent) => void;
}

export function useWaiterSocket({
  onSaleClosed,
  onNewSale,
  onBillRequested,
}: UseWaiterSocketOptions = {}) {
  const [connected, setConnected] = useState(false);
  const onSaleClosedRef = useRef(onSaleClosed);
  onSaleClosedRef.current = onSaleClosed;
  const onNewSaleRef = useRef(onNewSale);
  onNewSaleRef.current = onNewSale;
  const onBillRequestedRef = useRef(onBillRequested);
  onBillRequestedRef.current = onBillRequested;

  useEffect(() => {
    const socket: Socket = io("http://localhost:3004");

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join:waiter");
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("sale:closed", (event: SaleClosedEvent) => {
      onSaleClosedRef.current?.(event);
    });

    socket.on("order:new_sale", (event: NewSaleEvent) => {
      onNewSaleRef.current?.(event);
    });

    socket.on("bill:requested", (event: BillRequestedEvent) => {
      onBillRequestedRef.current?.(event);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { connected };
}
