"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import SaleDetail from "@/components/SaleDetail";
import ConnectionStatus from "@/components/ConnectionStatus";
import { useWaiterSocket } from "@/hooks/useWaiterSocket";
import type { SaleWithItems } from "@/types/sale";

export default function MesaComandaPage({ params }: { params: { numero: string } }) {
  const { numero } = params;
  const router = useRouter();
  const [sale, setSale] = useState<SaleWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    async function loadSale() {
      try {
        const response = await fetch(`http://localhost:3003/sales/table/${numero}`);
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
    try {
      const response = await fetch(`http://localhost:3003/sales/table/${numero}/close`, {
        method: "POST",
      });
      if (response.ok) {
        router.push("/");
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
