import { Module } from '@nestjs/common';
import { OrdersConsumer } from './orders.consumer';
import { OrdersController } from './orders.controller';
import { OrdersPublisher } from './orders.publisher';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrdersPublisher, OrdersConsumer],
})
export class OrdersModule {}
