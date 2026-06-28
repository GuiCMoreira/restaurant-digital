import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import type { OrderConfirmedEvent } from '@restaurant/shared-types';
import { SalesService } from './sales.service';

@Injectable()
export class SalesConsumer {
  constructor(private readonly salesService: SalesService) {}

  @RabbitSubscribe({
    exchange: 'restaurant',
    routingKey: 'order.confirmed',
    queue: 'sale.order.confirmed',
  })
  async handleOrderConfirmed(event: OrderConfirmedEvent): Promise<void> {
    await this.salesService.addOrderToSale(event);
  }
}
