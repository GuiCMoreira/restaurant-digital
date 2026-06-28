import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import type {
  KitchenQueuedEvent,
  KitchenStatusUpdatedEvent,
} from '@restaurant/shared-types';

const RESTAURANT_EXCHANGE = 'restaurant';

@Injectable()
export class KitchenPublisher {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishKitchenQueued(order: KitchenQueuedEvent): Promise<void> {
    await this.amqpConnection.publish(
      RESTAURANT_EXCHANGE,
      'kitchen.queued',
      order,
    );
  }

  async publishStatusUpdated(
    orderId: string,
    tableNumber: number,
    status: 'preparing' | 'ready',
  ): Promise<void> {
    const event: KitchenStatusUpdatedEvent = {
      orderId,
      tableNumber,
      status,
      updatedAt: new Date().toISOString(),
    };

    await this.amqpConnection.publish(
      RESTAURANT_EXCHANGE,
      'kitchen.status_updated',
      event,
    );
  }
}
