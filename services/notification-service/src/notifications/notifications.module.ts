import { Module } from '@nestjs/common';
import { NotificationsConsumer } from './notifications.consumer';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  providers: [NotificationsGateway, NotificationsConsumer],
})
export class NotificationsModule {}
