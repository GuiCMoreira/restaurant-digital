import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function formatOrderTime(iso: string) {
  const date = new Date(iso)
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `às ${hours}h${minutes}`
}
