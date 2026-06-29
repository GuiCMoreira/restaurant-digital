import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import type { KitchenStatusUpdatedEvent } from '@restaurant/shared-types';
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
}
