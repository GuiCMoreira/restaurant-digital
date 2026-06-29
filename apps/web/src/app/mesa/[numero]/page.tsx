"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { menu } from "@/data/menu";
import { useCart, useOrders } from "@/hooks/useCart";
import CategoryFilter from "@/components/CategoryFilter";
import MenuItemCard from "@/components/MenuItemCard";
import CartButton from "@/components/CartButton";

const THANK_YOU_DURATION = 3000;

export default function CardapioPage({ params }: { params: { numero: string } }) {
  const { numero } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const isReset = searchParams.get("reset") === "true";

  const [showThankYou, setShowThankYou] = useState(isReset);
  const [activeCategory, setActiveCategory] = useState(menu[0].id);
  const { items, addItem, updateQuantity, total, totalItems } = useCart(numero);
  const { orders } = useOrders(numero);

  const category = menu.find((c) => c.id === activeCategory) ?? menu[0];

  const quantityOf = (id: string) => items.find((i) => i.id === id)?.quantity ?? 0;

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
      {orders.length > 0 && (
        <Link
          href={`/mesa/${numero}/pedidos`}
          className="mb-4 flex items-center justify-between rounded-lg bg-mist px-4 py-3 text-sm font-medium text-forest"
        >
          <span>
            Você já tem {orders.length} {orders.length === 1 ? "pedido" : "pedidos"} em andamento
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
            />
          );
        })}
      </div>

      <CartButton tableNumber={numero} totalItems={totalItems} total={total} />
    </main>
  );
}
