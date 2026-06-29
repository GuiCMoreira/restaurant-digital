"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { menu } from "@/data/menu";
import { useCart } from "@/hooks/useCart";
import { useSocketContext } from "@/providers/SocketProvider";
import CategoryFilter from "@/components/CategoryFilter";
import MenuItemCard from "@/components/MenuItemCard";
import CartButton from "@/components/CartButton";

const SALE_SERVICE_URL =
  process.env.NEXT_PUBLIC_SALE_SERVICE_URL ?? "http://localhost:3003";

const THANK_YOU_DURATION = 3000;

export default function CardapioPage({ params }: { params: { numero: string } }) {
  const { numero } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const isReset = searchParams.get("reset") === "true";

  const [showThankYou, setShowThankYou] = useState(isReset);
  const [activeCategory, setActiveCategory] = useState(menu[0].id);
  const [billRequested, setBillRequested] = useState(false);
  const [hasOpenSale, setHasOpenSale] = useState(false);
  const { items, addItem, updateQuantity, total, totalItems } = useCart(numero);
  const { orders } = useSocketContext();

  const category = menu.find((c) => c.id === activeCategory) ?? menu[0];
  const quantityOf = (id: string) => items.find((i) => i.id === id)?.quantity ?? 0;
  const hasOrders = orders.length > 0 || hasOpenSale;

  useEffect(() => {
    fetch(`${SALE_SERVICE_URL}/sales/table/${numero}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((sale) => {
        if (sale) {
          setHasOpenSale(true);
          setBillRequested(sale.bill_requested ?? false);
        }
      })
      .catch(() => {});
  }, [numero]);

  useEffect(() => {
    if (!isReset) return;

    const timeout = setTimeout(() => {
      setShowThankYou(false);
      router.replace(`/mesa/${numero}`);
    }, THANK_YOU_DURATION);

    return () => clearTimeout(timeout);
  }, [isReset, numero, router]);

  if (showThankYou) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 text-center">
        <p className="font-serif text-2xl text-forest">
          Obrigado pela visita! A mesa está pronta para novos clientes.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 pb-28 pt-6">
      {billRequested && (
        <div className="mb-4 rounded-lg bg-spice px-4 py-3 text-sm font-medium text-linen">
          Conta solicitada — novos pedidos não são permitidos
        </div>
      )}

      {hasOrders && !billRequested && (
        <Link
          href={`/mesa/${numero}/pedidos`}
          className="mb-4 flex items-center justify-between rounded-lg bg-mist px-4 py-3 text-sm font-medium text-forest"
        >
          <span>
            {orders.length > 0
              ? `Você já tem ${orders.length} ${orders.length === 1 ? "pedido" : "pedidos"} em andamento`
              : "Você tem pedidos em andamento"}
          </span>
          <span>Ver meus pedidos →</span>
        </Link>
      )}

      <h1 className="mb-4 font-serif text-3xl font-bold text-forest">Olá! O que vai querer hoje?</h1>

      <CategoryFilter categories={menu} active={activeCategory} onChange={setActiveCategory} />

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {category.items.map((item) => {
          const quantity = quantityOf(item.id);
          return (
            <MenuItemCard
              key={item.id}
              item={item}
              quantity={quantity}
              onAdd={() => addItem(item)}
              onIncrement={() => (quantity === 0 ? addItem(item) : updateQuantity(item.id, quantity + 1))}
              onDecrement={() => updateQuantity(item.id, quantity - 1)}
              disabled={billRequested}
            />
          );
        })}
      </div>

      {!billRequested && (
        <CartButton tableNumber={numero} totalItems={totalItems} total={total} />
      )}
    </main>
  );
}
