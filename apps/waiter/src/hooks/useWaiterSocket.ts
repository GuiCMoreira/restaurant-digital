"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { SaleClosedEvent } from "@restaurant/shared-types";

export function useWaiterSocket(onSaleClosed?: (event: SaleClosedEvent) => void) {
  const [connected, setConnected] = useState(false);
  const callbackRef = useRef(onSaleClosed);
  callbackRef.current = onSaleClosed;

  useEffect(() => {
    const socket: Socket = io("http://localhost:3004");

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join:waiter");
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("sale:closed", (event: SaleClosedEvent) => {
      callbackRef.current?.(event);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { connected };
}
