"use client";

import ConnectionStatus from "./ConnectionStatus";

interface HeaderProps {
  connected: boolean;
  receivedCount: number;
  preparingCount: number;
  readyCount: number;
}

export default function Header({ connected, receivedCount, preparingCount, readyCount }: HeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="font-serif text-2xl font-bold text-linen">RestaurantOS</span>
        <span className="rounded-full bg-fern px-3 py-1 text-sm font-bold text-linen">Cozinha</span>
      </div>
      <div className="flex items-center gap-5">
        <span className="text-sm font-medium text-mist">
          {receivedCount} recebidos · {preparingCount} em preparo · {readyCount} finalizados
        </span>
        <ConnectionStatus connected={connected} />
      </div>
    </header>
  );
}
