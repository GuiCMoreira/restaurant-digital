import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import type {
  KitchenQueuedEvent,
  OrderConfirmedEvent,
} from '@restaurant/shared-types';
import { KitchenGateway } from './kitchen.gateway';
import { KitchenPublisher } from './kitchen.publisher';
import { KitchenService } from './kitchen.service';

@Injectable()
export class KitchenConsumer {
  constructor(
    private readonly kitchenService: KitchenService,
    private readonly kitchenPublisher: KitchenPublisher,
    private readonly kitchenGateway: KitchenGateway,
  ) {}

  @RabbitSubscribe({
    exchange: 'restaurant',
    routingKey: 'order.confirmed',
    queue: 'kitchen.order.confirmed',
  })
  async handleOrderConfirmed(event: OrderConfirmedEvent): Promise<void> {
    const kitchenQueuedEvent: KitchenQueuedEvent = {
      orderId: event.orderId,
      tableNumber: event.tableNumber,
      items: event.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
      })),
    };

    await this.kitchenService.addToQueue(kitchenQueuedEvent);
    await this.kitchenPublisher.publishKitchenQueued(kitchenQueuedEvent);
    await this.kitchenGateway.emitQueueUpdate();
  }
}
