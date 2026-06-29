"use client";

import { useRouter } from "next/navigation";
import type { SaleWithItems } from "@/types/sale";
import { formatCurrency, formatElapsed } from "@/lib/utils";

interface TableCardProps {
  sale: SaleWithItems;
  billRequested?: boolean;
  hasActiveOrders?: boolean;
}

export default function TableCard({
  sale,
  billRequested = false,
  hasActiveOrders = false,
}: TableCardProps) {
  const router = useRouter();

  const itemCount = sale.items.reduce(
    (sum, saleItem) => sum + saleItem.items.reduce((s, item) => s + item.quantity, 0),
    0
  );

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border-2 bg-white p-5 ${
        billRequested ? "border-spice" : "border-black/10"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-serif text-2xl font-bold text-forest">Mesa {sale.table_number}</h2>
        <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold text-forest">Aberta</span>
      </div>

      {(billRequested || hasActiveOrders) && (
        <div className="flex flex-wrap gap-2">
          {billRequested && (
            <span className="w-fit rounded-full bg-spice px-3 py-1 text-xs font-bold text-linen">
              Conta solicitada!
            </span>
          )}
          {hasActiveOrders && (
            <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
              Pedidos em preparo
            </span>
          )}
        </div>
      )}

      <span className="font-serif text-xl font-bold text-forest">
        {formatCurrency(sale.total_amount)}
      </span>

      <span className="text-sm text-muted">
        {itemCount} {itemCount === 1 ? "item pedido" : "itens pedidos"}
      </span>

      <span className="text-xs text-muted">{formatElapsed(sale.created_at)}</span>

      <button
        type="button"
        onClick={() => router.push(`/mesa/${sale.table_number}`)}
        className="mt-2 w-full rounded-lg bg-forest py-2 font-medium text-linen transition-colors hover:bg-fern"
      >
        Ver comanda →
      </button>
    </div>
  );
}
