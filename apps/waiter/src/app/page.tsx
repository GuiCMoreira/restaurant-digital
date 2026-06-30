"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import TableCard from "@/components/TableCard";
import ConnectionStatus from "@/components/ConnectionStatus";
import { useWaiterSocket } from "@/hooks/useWaiterSocket";
import type { SaleWithItems } from "@/types/sale";

const ACTIVE_ORDER_STATUSES = ["pending", "preparing"];

const ORDER_SERVICE_URL =
  process.env.NEXT_PUBLIC_ORDER_SERVICE_URL ?? "http://localhost:3001";
const SALE_SERVICE_URL =
  process.env.NEXT_PUBLIC_SALE_SERVICE_URL ?? "http://localhost:3003";

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

async function hasActiveKitchenOrders(tableNumber: number): Promise<boolean> {
  try {
    const response = await fetch(`${ORDER_SERVICE_URL}/orders/table/${tableNumber}`);
    if (!response.ok) return false;
    const orders: Array<{ status: string }> = await response.json();
    return orders.some((order) => ACTIVE_ORDER_STATUSES.includes(order.status));
  } catch {
    return false;
  }
}

export default function WaiterHomePage() {
  const [sales, setSales] = useState<SaleWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeKitchenTables, setActiveKitchenTables] = useState<Set<number>>(new Set());

  const loadSales = useCallback(async () => {
    try {
      const response = await fetch(`${SALE_SERVICE_URL}/sales`);
      if (!response.ok) return;
      const data: SaleWithItems[] = await response.json();
      setSales(data);

      const activeChecks = await Promise.all(
        data.map(async (sale) => ({
          tableNumber: sale.table_number,
          active: await hasActiveKitchenOrders(sale.table_number),
        }))
      );
      setActiveKitchenTables(
        new Set(activeChecks.filter((check) => check.active).map((check) => check.tableNumber))
      );
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
    onBillRequested: () => {
      playNotificationBeep();
      loadSales();
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
          <div className="stagger-list grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sales.map((sale) => (
              <TableCard
                key={sale.id}
                sale={sale}
                billRequested={sale.bill_requested}
                hasActiveOrders={activeKitchenTables.has(sale.table_number)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
