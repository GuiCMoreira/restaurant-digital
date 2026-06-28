import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import type { SaleClosedEvent } from '@restaurant/shared-types';
import { SaleRecord } from './sales.service';

const RESTAURANT_EXCHANGE = 'restaurant';

@Injectable()
export class SalesPublisher {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishSaleClosed(sale: SaleRecord): Promise<void> {
    const event: SaleClosedEvent = {
      tableNumber: sale.table_number,
      totalAmount: sale.total_amount,
      closedAt: sale.closed_at!,
    };

    await this.amqpConnection.publish(RESTAURANT_EXCHANGE, 'sale.closed', event);
  }
}
