import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import type { OrderConfirmedEvent } from '@restaurant/shared-types';
import { SalesPublisher } from './sales.publisher';
import { SalesService } from './sales.service';

@Injectable()
export class SalesConsumer {
  constructor(
    private readonly salesService: SalesService,
    private readonly salesPublisher: SalesPublisher,
  ) {}

  @RabbitSubscribe({
    exchange: 'restaurant',
    routingKey: 'order.confirmed',
    queue: 'sale.order.confirmed',
  })
  async handleOrderConfirmed(event: OrderConfirmedEvent): Promise<void> {
    const sale = await this.salesService.addOrderToSale(event);
    await this.salesPublisher.publishSaleUpdated(sale);
  }
}
