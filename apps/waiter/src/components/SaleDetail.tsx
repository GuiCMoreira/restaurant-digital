import type { SaleWithItems } from "@/types/sale";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface SaleDetailProps {
  sale: SaleWithItems;
}

export default function SaleDetail({ sale }: SaleDetailProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-black/10 bg-white p-5">
        <h2 className="mb-4 font-serif text-xl font-bold text-forest">Itens consumidos</h2>

        <div className="flex flex-col gap-4">
          {sale.items.map((saleItem) => (
            <div
              key={saleItem.id}
              className="flex flex-col gap-1 border-b border-black/5 pb-3 last:border-0 last:pb-0"
            >
              {saleItem.items.map((item, index) => (
                <div key={`${saleItem.id}-${index}`} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                </div>
              ))}
              <div className="flex justify-end text-sm font-medium text-forest">
                {formatCurrency(saleItem.amount)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4">
          <span className="font-medium">Total</span>
          <span className="font-serif text-2xl font-bold text-forest">
            {formatCurrency(sale.total_amount)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-5 text-sm">
        <span className="text-muted">Aberta em {formatDateTime(sale.created_at)}</span>
        <span className="rounded-full bg-mist px-3 py-1 font-bold text-forest">Aberta</span>
      </div>
    </div>
  );
}
