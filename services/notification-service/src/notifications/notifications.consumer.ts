import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import type {
  KitchenQueuedEvent,
  KitchenStatusUpdatedEvent,
  SaleClosedEvent,
  SaleUpdatedEvent,
} from '@restaurant/shared-types';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsConsumer {
  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  @RabbitSubscribe({
    exchange: 'restaurant',
    routingKey: 'sale.updated',
    queue: 'notification.sale.updated',
  })
  handleSaleUpdated(event: SaleUpdatedEvent): void {
    this.notificationsGateway.notifyWaiter('order:new_sale', {
      tableNumber: event.tableNumber,
    });
  }

  @RabbitSubscribe({
    exchange: 'restaurant',
    routingKey: 'kitchen.queued',
    queue: 'notification.kitchen.queued',
  })
  handleKitchenQueued(event: KitchenQueuedEvent): void {
    this.notificationsGateway.notifyKitchen('order:new', event);
  }

  @RabbitSubscribe({
    exchange: 'restaurant',
    routingKey: 'kitchen.status_updated',
    queue: 'notification.kitchen.status',
  })
  handleKitchenStatusUpdated(event: KitchenStatusUpdatedEvent): void {
    const { orderId, tableNumber, status } = event;

    if (status === 'preparing') {
      this.notificationsGateway.notifyTable(tableNumber, 'order:preparing', {
        orderId,
        tableNumber,
      });
    } else if (status === 'ready') {
      this.notificationsGateway.notifyTable(tableNumber, 'order:ready', {
        orderId,
        tableNumber,
      });
    }

    this.notificationsGateway.notifyKitchen('order:status_updated', event);
  }

  @RabbitSubscribe({
    exchange: 'restaurant',
    routingKey: 'sale.closed',
    queue: 'notification.sale.closed',
  })
  handleSaleClosed(event: SaleClosedEvent): void {
    console.log('[Notification] emitindo sale:closed para table:', event.tableNumber);

    this.notificationsGateway.notifyWaiter('sale:closed', event);
    this.notificationsGateway.notifyTable(
      Number(event.tableNumber),
      'sale:closed',
      event,
    );
  }
}
