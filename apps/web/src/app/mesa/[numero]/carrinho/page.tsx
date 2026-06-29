"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";
import QuantityControl from "@/components/QuantityControl";

export default function CarrinhoPage({ params }: { params: { numero: string } }) {
  const { numero } = params;
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, total } = useCart(numero);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3001/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: Number(numero),
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      if (!response.ok) throw new Error("Falha ao confirmar pedido");

      const data = await response.json();
      const orderId = data.id;
      window.localStorage.setItem(
        `order:${orderId}`,
        JSON.stringify({ tableNumber: numero, items, total })
      );
      clearCart();
      router.push(`/mesa/${numero}/pedido?orderId=${orderId}`);
    } catch {
      setError("Não foi possível confirmar o pedido. Tente novamente.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-8 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push(`/mesa/${numero}`)}
          aria-label="Voltar"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-mist text-forest transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-serif text-2xl text-forest">Seu pedido</h1>
      </div>

      {items.length === 0 ? (
        <p className="text-muted">Seu carrinho está vazio.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-black/10 bg-white p-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <p className="text-sm font-bold">{item.name}</p>
                  <p className="font-serif text-sm text-forest">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <QuantityControl
                  quantity={item.quantity}
                  onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                  onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remover ${item.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-spice hover:bg-mist transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          <div className="mt-2 flex items-center justify-between border-t border-black/10 pt-4">
            <span className="font-medium">Total</span>
            <span className="font-serif text-xl text-forest">{formatCurrency(total)}</span>
          </div>

          {error && <p className="text-sm text-spice">{error}</p>}

          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="mt-2 w-full rounded-lg bg-forest py-3 font-medium text-linen hover:bg-fern transition-colors disabled:opacity-60"
          >
            {submitting ? "Confirmando..." : "Confirmar pedido"}
          </button>
        </div>
      )}
    </main>
  );
}
