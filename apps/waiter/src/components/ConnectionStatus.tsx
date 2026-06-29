"use client";

interface ConnectionStatusProps {
  connected: boolean;
}

export default function ConnectionStatus({ connected }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-3 w-3">
        {connected && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex h-3 w-3 rounded-full ${
            connected ? "bg-green-500" : "bg-red-500"
          }`}
        />
      </span>
      <span className="text-sm text-muted">{connected ? "Conectado" : "Desconectado"}</span>
    </div>
  );
}
