import type { OrderItem } from "@restaurant/shared-types";

export interface SaleItemRecord {
  id: string;
  sale_id: string;
  order_id: string;
  items: OrderItem[];
  amount: number;
  created_at: string;
}

export interface SaleRecord {
  id: string;
  table_number: number;
  status: "open" | "closed";
  total_amount: number;
  created_at: string;
  closed_at: string | null;
  bill_requested: boolean;
  bill_requested_at: string | null;
}

export interface SaleWithItems extends SaleRecord {
  items: SaleItemRecord[];
}
