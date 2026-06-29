"use client";

import { Minus, Plus } from "lucide-react";

interface QuantityControlProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
}

export default function QuantityControl({
  quantity,
  onIncrement,
  onDecrement,
  disabled = false,
}: QuantityControlProps) {
  return (
    <div className="flex items-center gap-3 text-forest">
      <button
        type="button"
        onClick={onDecrement}
        disabled={disabled}
        aria-label="Diminuir quantidade"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-forest transition-colors hover:bg-mist disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Minus size={16} />
      </button>
      <span className="w-5 text-center font-medium">{quantity}</span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={disabled}
        aria-label="Aumentar quantidade"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-linen transition-colors hover:bg-fern disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
