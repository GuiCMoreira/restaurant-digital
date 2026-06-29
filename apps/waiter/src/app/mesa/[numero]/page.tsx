"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import SaleDetail from "@/components/SaleDetail";
import ConnectionStatus from "@/components/ConnectionStatus";
import { useWaiterSocket } from "@/hooks/useWaiterSocket";
import type { SaleWithItems } from "@/types/sale";

const SALE_SERVICE_URL =
  process.env.NEXT_PUBLIC_SALE_SERVICE_URL ?? "http://localhost:3003";

export default function MesaComandaPage({ params }: { params: { numero: string } }) {
  const { numero } = params;
  const router = useRouter();
  const [sale, setSale] = useState<SaleWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSale() {
      try {
        const response = await fetch(`${SALE_SERVICE_URL}/sales/table/${numero}`);
        if (response.ok) {
          const data = await response.json();
          setSale(data);
        }
      } finally {
        setLoading(false);
      }
    }

    loadSale();
  }, [numero]);

  const { connected } = useWaiterSocket({
    onSaleClosed: (event) => {
      if (String(event.tableNumber) === numero) {
        router.push("/");
      }
    },
  });

  async function handleCloseBill() {
    setClosing(true);
    setCloseError(null);
    try {
      const response = await fetch(`${SALE_SERVICE_URL}/sales/table/${numero}/close`, {
        method: "POST",
      });

      if (response.ok) {
        router.push("/");
        return;
      }

      if (response.status === 400) {
        setCloseError(
          "Não é possível fechar a conta — há pedidos em preparo na cozinha. Aguarde todos os pedidos serem finalizados."
        );
      }
    } finally {
      setClosing(false);
    }
  }

  return (
    <div className="min-h-screen bg-linen">
      <Navbar />

      <main className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              aria-label="Voltar"
              className="flex h-9 w-9 items-center justify-center rounded-full text-forest hover:bg-mist transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-serif text-2xl font-bold text-forest">Mesa {numero} — Comanda</h1>
          </div>
          <ConnectionStatus connected={connected} />
        </div>

        {loading ? (
          <p className="text-muted">Carregando comanda...</p>
        ) : !sale ? (
          <p className="text-muted">Nenhuma comanda aberta para esta mesa.</p>
        ) : (
          <>
            <SaleDetail sale={sale} />

            {closeError && (
              <p className="mt-4 rounded-lg bg-spice/10 px-4 py-3 text-sm font-medium text-spice">
                {closeError}
              </p>
            )}

            <button
              type="button"
              onClick={handleCloseBill}
              disabled={closing}
              className="mt-6 w-full rounded-lg bg-spice py-3 font-medium text-linen transition-colors hover:bg-spice/90 disabled:opacity-60"
            >
              {closing ? "Fechando conta..." : "Fechar conta"}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
