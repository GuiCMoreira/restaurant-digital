"use client";

import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

interface CartButtonProps {
  tableNumber: string;
  totalItems: number;
  total: number;
}

export default function CartButton({ tableNumber, totalItems, total }: CartButtonProps) {
  const router = useRouter();

  if (totalItems === 0) return null;

  return (
    <button
      type="button"
      onClick={() => router.push(`/mesa/${tableNumber}/carrinho`)}
      className="fixed inset-x-4 bottom-4 z-20 flex items-center justify-between rounded-lg bg-forest px-5 py-4 text-linen shadow-lg hover:bg-fern transition-colors sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2"
    >
      <span className="font-medium">
        Ver carrinho ({totalItems} {totalItems === 1 ? "item" : "itens"})
      </span>
      <span className="font-serif">→ {formatCurrency(total)}</span>
    </button>
  );
}
