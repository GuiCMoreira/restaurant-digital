"use client";

import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Home, ClipboardList } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useOrders } from "@/hooks/useOrders";

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
        <span className="font-serif text-lg sm:text-2xl font-bold text-linen">RestaurantOS</span>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 bg-forest px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={() => router.push(`/mesa/${tableNumber}`)}
          className="font-serif text-lg sm:text-2xl font-bold text-linen whitespace-nowrap"
        >
          RestaurantOS
        </button>
        <span className="whitespace-nowrap rounded-full bg-fern px-2 py-0.5 text-xs sm:px-3 sm:py-1 sm:text-sm font-medium text-linen">
          Mesa {tableNumber}
        </span>
      </div>

      <div className="flex flex-shrink-0 items-center gap-1 sm:gap-4">
        <button
          type="button"
          onClick={() => router.push(`/mesa/${tableNumber}`)}
          aria-label="Cardápio"
          className="flex items-center text-sm font-medium text-linen hover:underline"
        >
          <Home size={18} className="sm:hidden" />
          <span className="hidden sm:inline">Cardápio</span>
        </button>

        {orders.length > 0 && (
          <button
            type="button"
            onClick={() => router.push(`/mesa/${tableNumber}/pedidos`)}
            aria-label="Meus pedidos"
            className="flex items-center text-sm font-medium text-linen hover:underline"
          >
            <ClipboardList size={18} className="sm:hidden" />
            <span className="hidden sm:inline">Meus pedidos</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => router.push(`/mesa/${tableNumber}/carrinho`)}
          aria-label="Ver carrinho"
          className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-linen transition-colors hover:bg-fern"
        >
          <ShoppingCart size={20} />
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-spice px-1 text-[11px] font-bold text-linen">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
