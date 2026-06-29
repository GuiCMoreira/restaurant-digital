interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center">
      <span className="text-4xl">🍽️</span>
      <p className="text-sm font-medium text-gray-500">{message}</p>
    </div>
  );
}
