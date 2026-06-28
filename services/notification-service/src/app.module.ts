import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    {
      ...RabbitMQModule.forRoot({
        uri: process.env.RABBITMQ_URL ?? '',
        exchanges: [
          {
            name: 'restaurant',
            type: 'topic',
          },
        ],
        connectionInitOptions: { wait: false },
      }),
      global: true,
    },
    NotificationsModule,
  ],
})
export class AppModule {}
