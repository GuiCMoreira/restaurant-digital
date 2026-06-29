"use client";

import { Minus, Plus } from "lucide-react";

interface QuantityControlProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export default function QuantityControl({ quantity, onIncrement, onDecrement }: QuantityControlProps) {
  return (
    <div className="flex items-center gap-3 text-forest">
      <button
        type="button"
        onClick={onDecrement}
        aria-label="Diminuir quantidade"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-forest hover:bg-mist transition-colors"
      >
        <Minus size={16} />
      </button>
      <span className="w-5 text-center font-medium">{quantity}</span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label="Aumentar quantidade"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-linen hover:bg-fern transition-colors"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
