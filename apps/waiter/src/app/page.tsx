"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import TableCard from "@/components/TableCard";
import ConnectionStatus from "@/components/ConnectionStatus";
import { useWaiterSocket } from "@/hooks/useWaiterSocket";
import type { SaleWithItems } from "@/types/sale";

function playNotificationBeep() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.3);
  } catch {
    // Web Audio API indisponível — ignora o som
  }
}

export default function WaiterHomePage() {
  const [sales, setSales] = useState<SaleWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [billRequests, setBillRequests] = useState<Set<number>>(new Set());

  const loadSales = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3003/sales");
      if (!response.ok) return;
      const data: SaleWithItems[] = await response.json();
      setSales(data);
      setBillRequests((current) => {
        const openTables = new Set(data.map((sale) => sale.table_number));
        return new Set(Array.from(current).filter((tableNumber) => openTables.has(tableNumber)));
      });
    } catch {
      // sale-service indisponível — mantém a última lista carregada
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSales();
    const interval = setInterval(loadSales, 30000);
    return () => clearInterval(interval);
  }, [loadSales]);

  const { connected } = useWaiterSocket({
    onSaleClosed: () => loadSales(),
    onNewSale: () => loadSales(),
    onBillRequested: (event) => {
      setBillRequests((current) => new Set(current).add(event.tableNumber));
      playNotificationBeep();
    },
  });

  return (
    <div className="min-h-screen bg-linen">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl font-bold text-forest">Mesas ativas</h1>
            <p className="mt-1 text-sm text-muted">
              {sales.length} {sales.length === 1 ? "mesa" : "mesas"} com comanda aberta
            </p>
          </div>
          <ConnectionStatus connected={connected} />
        </div>

        {!loading && sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <span className="text-6xl">🎉</span>
            <p className="text-xl font-medium text-forest">Nenhuma mesa com comanda aberta</p>
            <p className="text-sm text-muted">Todas as contas foram fechadas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sales.map((sale) => (
              <TableCard
                key={sale.id}
                sale={sale}
                billRequested={billRequests.has(sale.table_number)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
