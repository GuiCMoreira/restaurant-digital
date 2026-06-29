import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import type { SaleClosedEvent, SaleUpdatedEvent } from '@restaurant/shared-types';
import { SaleRecord, SaleWithItems } from './sales.service';

const RESTAURANT_EXCHANGE = 'restaurant';

@Injectable()
export class SalesPublisher {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishSaleClosed(sale: SaleWithItems): Promise<void> {
    const event: SaleClosedEvent = {
      tableNumber: sale.table_number,
      totalAmount: sale.total_amount,
      closedAt: sale.closed_at!,
      orderIds: sale.items.map((item) => item.order_id),
    };

    await this.amqpConnection.publish(RESTAURANT_EXCHANGE, 'sale.closed', event);
  }

  async publishSaleUpdated(sale: SaleRecord): Promise<void> {
    const event: SaleUpdatedEvent = {
      tableNumber: sale.table_number,
      saleId: sale.id,
      totalAmount: sale.total_amount,
    };

    await this.amqpConnection.publish(RESTAURANT_EXCHANGE, 'sale.updated', event);
  }
}
