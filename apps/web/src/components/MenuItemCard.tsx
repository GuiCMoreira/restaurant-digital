"use client";

import { MenuItem } from "@/data/menu";
import { formatCurrency } from "@/lib/utils";
import QuantityControl from "./QuantityControl";

interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
}

export default function MenuItemCard({
  item,
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
  disabled = false,
}: MenuItemCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-black/10 bg-white">
      <div className="flex h-[120px] items-center justify-center bg-mist text-5xl">{item.emoji}</div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="font-sans font-bold text-sm">{item.name}</p>
        <p className="font-serif text-forest">{formatCurrency(item.price)}</p>
        <div className="mt-auto flex justify-end">
          {quantity > 0 ? (
            <QuantityControl
              quantity={quantity}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
              disabled={disabled}
            />
          ) : (
            <button
              type="button"
              onClick={onAdd}
              disabled={disabled}
              aria-label={`Adicionar ${item.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-linen text-lg transition-colors hover:bg-fern disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
