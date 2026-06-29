"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrders, type OrderStatus } from "@/hooks/useCart";
import { useSocketContext } from "@/providers/SocketProvider";
import { formatCurrency, formatOrderTime } from "@/lib/utils";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pendente",
  preparing: "Em preparo",
  ready: "Pronto",
};

const STATUS_CLASS: Record<OrderStatus, string> = {
  pending: "bg-gray-200 text-gray-700",
  preparing: "bg-blue-100 text-blue-700",
  ready: "bg-mist text-forest",
};

export default function PedidosPage({ params }: { params: { numero: string } }) {
  const { numero } = params;
  const router = useRouter();
  const { orders, totalAllOrders } = useOrders(numero);
  const { requestBill } = useSocketContext();
  const [billRequested, setBillRequested] = useState(false);

  function handleRequestBill() {
    requestBill();
    setBillRequested(true);
  }

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <main className="mx-auto max-w-2xl px-4 pb-8 pt-6">
      <h1 className="mb-6 font-serif text-2xl text-forest">Seus pedidos — Mesa {numero}</h1>

      {sortedOrders.length === 0 ? (
        <p className="text-muted">Você ainda não fez nenhum pedido nesta mesa.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {sortedOrders.map((order) => (
            <div key={order.orderId} className="rounded-lg border border-black/10 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted">{formatOrderTime(order.createdAt)}</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_CLASS[order.status]}`}
                >
                  {STATUS_LABEL[order.status]}
                </span>
              </div>

              <div className="flex flex-col gap-1">
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
                <span>Total do pedido</span>
                <span className="font-serif text-forest">{formatCurrency(order.total)}</span>
              </div>
            </div>
          ))}

          <div className="mt-2 flex items-center justify-between rounded-lg bg-mist p-4">
            <span className="font-medium text-forest">Total da mesa até agora</span>
            <span className="font-serif text-xl font-bold text-forest">
              {formatCurrency(totalAllOrders)}
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => router.push(`/mesa/${numero}`)}
        className="mt-6 w-full rounded-lg bg-forest py-3 text-center font-medium text-linen transition-colors hover:bg-fern"
      >
        ＋ Adicionar mais itens
      </button>

      {billRequested ? (
        <p className="mt-3 w-full rounded-lg bg-mist py-3 text-center font-medium text-forest">
          Garçom notificado! Aguarde um momento.
        </p>
      ) : (
        <button
          type="button"
          onClick={handleRequestBill}
          className="mt-3 w-full rounded-lg bg-spice py-3 font-medium text-linen transition-colors hover:bg-spice/90"
        >
          Chamar garçom para a conta
        </button>
      )}
    </main>
  );
}
