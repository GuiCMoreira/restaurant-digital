"use client";

import { KitchenOrder } from "@/types/order";
import { useElapsedMinutes } from "@/hooks/useElapsedMinutes";

export type KitchenColumn = "received" | "preparing" | "ready";

interface OrderCardProps {
  order: KitchenOrder;
  column: KitchenColumn;
  onAction?: (orderId: string) => void;
  updating?: boolean;
}

const BORDER_COLOR: Record<KitchenColumn, string> = {
  received: "#F59E0B",
  preparing: "#2563EB",
  ready: "#1B4332",
};

const STATUS_LABEL: Record<KitchenColumn, string> = {
  received: "Recebido",
  preparing: "Em preparo",
  ready: "Pronto",
};

const STATUS_BADGE_CLASS: Record<KitchenColumn, string> = {
  received: "bg-amber-100 text-amber-800",
  preparing: "bg-blue-100 text-blue-700",
  ready: "bg-mist text-forest",
};

export default function OrderCard({ order, column, onAction, updating }: OrderCardProps) {
  const minutes = useElapsedMinutes(order.createdAt);

  return (
    <div
      className={`flex flex-col gap-3 rounded-lg bg-white p-4 transition-shadow duration-200 hover:shadow-md ${column === "ready" ? "opacity-75" : "animate-slide-in-right"}`}
      style={{ borderLeft: `3px solid ${BORDER_COLOR[column]}` }}
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

      <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${STATUS_BADGE_CLASS[column]} ${column === "preparing" ? "animate-pulse-badge" : ""}`}>
        {STATUS_LABEL[column]}
      </span>

      {column === "received" && (
        <button
          type="button"
          onClick={() => onAction?.(order.orderId)}
          disabled={updating}
          className="w-full rounded-lg bg-[#2563EB] py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          {updating ? "Atualizando..." : "Iniciar preparo"}
        </button>
      )}

      {column === "preparing" && (
        <button
          type="button"
          onClick={() => onAction?.(order.orderId)}
          disabled={updating}
          className="w-full rounded-lg bg-forest py-2 font-medium text-linen transition-colors hover:bg-fern disabled:opacity-60"
        >
          {updating ? "Atualizando..." : "Marcar como pronto"}
        </button>
      )}
    </div>
  );
}
