import { Module } from '@nestjs/common';
import { KitchenConsumer } from './kitchen.consumer';
import { KitchenController } from './kitchen.controller';
import { KitchenGateway } from './kitchen.gateway';
import { KitchenPublisher } from './kitchen.publisher';
import { KitchenService } from './kitchen.service';

@Module({
  controllers: [KitchenController],
  providers: [
    KitchenService,
    KitchenPublisher,
    KitchenGateway,
    KitchenConsumer,
  ],
})
export class KitchenModule {}
