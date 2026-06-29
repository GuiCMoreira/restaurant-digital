import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import type { KitchenStatusUpdatedEvent, SaleClosedEvent } from '@restaurant/shared-types';
import { OrdersService } from './orders.service';

@Injectable()
export class OrdersConsumer {
  constructor(private readonly ordersService: OrdersService) {}

  @RabbitSubscribe({
    exchange: 'restaurant',
    routingKey: 'kitchen.status_updated',
    queue: 'order.kitchen.status_updated',
  })
  async handleKitchenStatusUpdated(
    event: KitchenStatusUpdatedEvent,
  ): Promise<void> {
    await this.ordersService.updateStatus(event.orderId, event.status);
  }

  @RabbitSubscribe({
    exchange: 'restaurant',
    routingKey: 'sale.closed',
    queue: 'order.sale.closed',
  })
  async handleSaleClosed(event: SaleClosedEvent): Promise<void> {
    await this.ordersService.closeOrdersByIds(event.orderIds);
  }
}
