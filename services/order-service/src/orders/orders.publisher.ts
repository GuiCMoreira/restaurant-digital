import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import type {
  OrderConfirmedEvent,
  OrderCreatedEvent,
} from '@restaurant/shared-types';
import { OrderRecord } from './orders.service';

const RESTAURANT_EXCHANGE = 'restaurant';
const ESTIMATED_PREPARATION_TIME_MINUTES = 15;

@Injectable()
export class OrdersPublisher {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishOrderCreated(order: OrderRecord): Promise<void> {
    const event: OrderCreatedEvent = {
      orderId: order.id,
      tableNumber: order.table_number,
      items: order.items,
      totalAmount: order.total_amount,
      createdAt: order.created_at,
    };

    await this.amqpConnection.publish(
      RESTAURANT_EXCHANGE,
      'order.created',
      event,
    );
  }

  async publishOrderConfirmed(order: OrderRecord): Promise<void> {
    const event: OrderConfirmedEvent = {
      orderId: order.id,
      tableNumber: order.table_number,
      items: order.items,
      estimatedTime: ESTIMATED_PREPARATION_TIME_MINUTES,
    };

    await this.amqpConnection.publish(
      RESTAURANT_EXCHANGE,
      'order.confirmed',
      event,
    );
  }
}
