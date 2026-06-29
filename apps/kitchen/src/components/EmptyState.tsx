export default function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
      <span className="text-6xl">🍽️</span>
      <p className="text-xl font-medium text-white">Nenhum pedido no momento</p>
      <p className="text-sm text-mist">Os pedidos aparecerão aqui automaticamente</p>
    </div>
  );
}
