"use client";

import { useState } from "react";
import { menu } from "@/data/menu";
import { useCart } from "@/hooks/useCart";
import CategoryFilter from "@/components/CategoryFilter";
import MenuItemCard from "@/components/MenuItemCard";
import CartButton from "@/components/CartButton";

export default function CardapioPage({ params }: { params: { numero: string } }) {
  const { numero } = params;
  const [activeCategory, setActiveCategory] = useState(menu[0].id);
  const { items, addItem, updateQuantity, total, totalItems } = useCart(numero);

  const category = menu.find((c) => c.id === activeCategory) ?? menu[0];

  const quantityOf = (id: string) => items.find((i) => i.id === id)?.quantity ?? 0;

  return (
    <main className="mx-auto max-w-4xl px-4 pb-28 pt-6">
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
