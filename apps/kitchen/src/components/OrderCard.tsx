"use client";

import { KitchenOrder } from "@/types/order";
import { useElapsedMinutes } from "@/hooks/useElapsedMinutes";

interface OrderCardProps {
  order: KitchenOrder;
  onMarkReady: (orderId: string) => void;
  updating: boolean;
}

export default function OrderCard({ order, onMarkReady, updating }: OrderCardProps) {
  const minutes = useElapsedMinutes(order.createdAt);
  const isReady = order.status === "ready";

  return (
    <div
      className="flex flex-col gap-3 rounded-lg bg-white p-4"
      style={{ borderLeft: `3px solid ${isReady ? "#1B4332" : "#2563EB"}` }}
    >
      <div className="flex items-start justify-between">
        <h2 className="font-serif text-2xl font-bold text-forest">Mesa {order.tableNumber}</h2>
        <span className="text-xs text-gray-500">{minutes <= 0 ? "agora" : `há ${minutes} min`}</span>
      </div>

      <ul className="flex flex-col gap-1 text-sm text-[#1A1A1A]">
        {order.items.map((item, index) => (
          <li key={`${item.name}-${index}`}>
            {item.quantity}x {item.name}
          </li>
        ))}
      </ul>

      <span
        className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
          isReady ? "bg-mist text-forest" : "bg-blue-100 text-blue-700"
        }`}
      >
        {isReady ? "Pronto" : "Em preparo"}
      </span>

      {isReady ? (
        <button
          type="button"
          disabled
          className="w-full rounded-lg bg-mist py-2 font-medium text-forest disabled:cursor-not-allowed"
        >
          Pedido pronto ✓
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onMarkReady(order.orderId)}
          disabled={updating}
          className="w-full rounded-lg bg-forest py-2 font-medium text-linen transition-colors hover:bg-fern disabled:opacity-60"
        >
          {updating ? "Atualizando..." : "Marcar como pronto"}
        </button>
      )}
    </div>
  );
}
