import { Module } from '@nestjs/common';
import { SalesConsumer } from './sales.consumer';
import { SalesController } from './sales.controller';
import { SalesPublisher } from './sales.publisher';
import { SalesService } from './sales.service';

@Module({
  controllers: [SalesController],
  providers: [SalesService, SalesPublisher, SalesConsumer],
})
export class SalesModule {}
