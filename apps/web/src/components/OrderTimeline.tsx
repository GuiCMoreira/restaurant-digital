"use client";

import { cn } from "@/lib/utils";

export type OrderStatus = "confirmed" | "preparing" | "ready" | "closed";

const STEPS: { id: OrderStatus; label: string }[] = [
  { id: "confirmed", label: "Pedido confirmado" },
  { id: "preparing", label: "Em preparo" },
  { id: "ready", label: "Pronto para entrega!" },
  { id: "closed", label: "Conta fechada" },
];

interface OrderTimelineProps {
  currentStatus: OrderStatus;
}

export default function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  const currentIndex = STEPS.findIndex((step) => step.id === currentStatus);

  return (
    <ol className="flex flex-col gap-6">
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <li key={step.id} className="flex items-center gap-4">
            <span
              className={cn(
                "flex h-4 w-4 shrink-0 rounded-full border-2",
                isDone && "border-forest bg-forest",
                isActive && "border-forest bg-forest animate-pulse",
                !isDone && !isActive && "border-black/20 bg-white"
              )}
            />
            <span
              className={cn(
                "text-sm font-medium",
                isActive ? "text-forest font-bold" : isDone ? "text-forest" : "text-muted"
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
