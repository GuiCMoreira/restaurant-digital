"use client";

import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart, useOrders } from "@/hooks/useCart";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const match = pathname.match(/^\/mesa\/([^/]+)/);
  const tableNumber = match?.[1];

  const { totalItems } = useCart(tableNumber ?? "0");
  const { orders } = useOrders(tableNumber ?? "0");

  if (!tableNumber) {
    return (
      <header className="sticky top-0 z-30 flex items-center bg-forest px-4 py-3">
        <span className="font-serif text-2xl font-bold text-linen">RestaurantOS</span>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-forest px-4 py-3">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push(`/mesa/${tableNumber}`)}
          className="font-serif text-2xl font-bold text-linen"
        >
          RestaurantOS
        </button>
        <span className="rounded-full bg-fern px-3 py-1 text-sm font-medium text-linen">
          Mesa {tableNumber}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push(`/mesa/${tableNumber}`)}
          className="text-sm font-medium text-linen hover:underline"
        >
          Cardápio
        </button>

        {orders.length > 0 && (
          <button
            type="button"
            onClick={() => router.push(`/mesa/${tableNumber}/pedidos`)}
            className="text-sm font-medium text-linen hover:underline"
          >
            Meus pedidos
          </button>
        )}

        <button
          type="button"
          onClick={() => router.push(`/mesa/${tableNumber}/carrinho`)}
          aria-label="Ver carrinho"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-linen hover:bg-fern transition-colors"
        >
          <ShoppingCart size={20} />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-spice px-1 text-[11px] font-bold text-linen">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
