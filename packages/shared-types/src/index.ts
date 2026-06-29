export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

export interface OrderCreatedEvent {
  orderId: string
  tableNumber: number
  items: OrderItem[]
  totalAmount: number
  createdAt: string
}

export interface OrderConfirmedEvent {
  orderId: string
  tableNumber: number
  items: OrderItem[]
  estimatedTime: number
}

export interface KitchenQueuedEvent {
  orderId: string
  tableNumber: number
  items: Array<{
    name: string
    quantity: number
  }>
}

export interface KitchenStatusUpdatedEvent {
  orderId: string
  tableNumber: number
  status: 'preparing' | 'ready'
  updatedAt: string
}

export interface SaleClosedEvent {
  tableNumber: number
  totalAmount: number
  closedAt: string
  orderIds: string[]
}

export interface SaleUpdatedEvent {
  tableNumber: number
  saleId: string
  totalAmount: number
}

export type RabbitMQQueues = {
  ORDER_CREATED: 'order.created'
  ORDER_CONFIRMED: 'order.confirmed'
  KITCHEN_QUEUED: 'kitchen.queued'
  KITCHEN_STATUS_UPDATED: 'kitchen.status_updated'
  NOTIFY_TABLE: 'notify.table'
  SALE_CLOSED: 'sale.closed'
}
