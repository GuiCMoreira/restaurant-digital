export type KitchenOrderStatus = "pending" | "preparing" | "ready";

export interface KitchenOrderItem {
  name: string;
  quantity: number;
}

export interface KitchenOrder {
  orderId: string;
  tableNumber: number;
  items: KitchenOrderItem[];
  status: KitchenOrderStatus;
  createdAt: string;
  updatedAt: string;
}
