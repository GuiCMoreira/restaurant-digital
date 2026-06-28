import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { KitchenModule } from './kitchen/kitchen.module';

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
    KitchenModule,
  ],
})
export class AppModule {}
