"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { formatCurrency } from "@/lib/utils";
import OrderTimeline, { OrderStatus } from "@/components/OrderTimeline";
import type { CartItem } from "@/hooks/useCart";

interface SavedOrder {
  tableNumber: string;
  items: CartItem[];
  total: number;
}

export default function PedidoPage({ params }: { params: { numero: string } }) {
  const { numero } = params;
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [status, setStatus] = useState<OrderStatus>("confirmed");
  const [order, setOrder] = useState<SavedOrder | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    const raw = window.localStorage.getItem(`order:${orderId}`);
    if (raw) setOrder(JSON.parse(raw));
  }, [orderId]);

  useEffect(() => {
    const socket: Socket = io("http://localhost:3004");

    socket.on("connect", () => {
      socket.emit("join:table", { tableNumber: Number(numero) });
    });

    socket.on("order:preparing", () => setStatus("preparing"));
    socket.on("order:ready", () => setStatus("ready"));
    socket.on("sale:closed", () => setStatus("closed"));

    return () => {
      socket.disconnect();
    };
  }, [numero]);

  async function handleCloseBill() {
    setClosing(true);
    try {
      await fetch(`http://localhost:3003/sales/table/${numero}/close`, {
        method: "POST",
      });
    } finally {
      setClosing(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-8 pt-6">
      <h1 className="font-serif text-2xl text-forest">Acompanhe seu pedido</h1>
      <p className="mt-1 text-sm text-muted">Mesa {numero}</p>

      <div className="mt-8 rounded-lg border border-black/10 bg-white p-5">
        <OrderTimeline currentStatus={status} />
      </div>

      {order && (
        <div className="mt-6 rounded-lg border border-black/10 bg-white p-5">
          <h2 className="mb-3 font-bold text-sm">Itens do pedido</h2>
          <div className="flex flex-col gap-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.emoji} {item.quantity}x {item.name}
                </span>
                <span className="font-serif text-forest">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-black/10 pt-3 font-medium">
            <span>Total</span>
            <span className="font-serif text-forest">{formatCurrency(order.total)}</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleCloseBill}
        disabled={closing || status === "closed"}
        className="mt-6 w-full rounded-lg bg-spice py-3 font-medium text-linen hover:bg-spice/90 transition-colors disabled:opacity-60"
      >
        {status === "closed" ? "Conta fechada" : closing ? "Solicitando..." : "Pedir a conta"}
      </button>
    </main>
  );
}
