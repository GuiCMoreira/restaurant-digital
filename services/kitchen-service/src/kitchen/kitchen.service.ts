import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type { KitchenQueuedEvent } from '@restaurant/shared-types';

export interface KitchenOrderRecord {
  orderId: string;
  tableNumber: number;
  items: Array<{ name: string; quantity: number }>;
  status: 'pending' | 'preparing' | 'ready';
  updatedAt: string;
}

const QUEUE_KEY = 'kitchen:queue';
const orderKey = (orderId: string) => `kitchen:order:${orderId}`;

@Injectable()
export class KitchenService {
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis(
      this.configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379',
    );
  }

  async addToQueue(event: KitchenQueuedEvent): Promise<KitchenOrderRecord> {
    const order: KitchenOrderRecord = {
      orderId: event.orderId,
      tableNumber: event.tableNumber,
      items: event.items,
      status: 'pending',
      updatedAt: new Date().toISOString(),
    };

    await this.redis.lpush(QUEUE_KEY, event.orderId);
    await this.redis.set(orderKey(event.orderId), JSON.stringify(order));

    return order;
  }

  async getQueue(): Promise<KitchenOrderRecord[]> {
    const orderIds = await this.redis.lrange(QUEUE_KEY, 0, -1);
    if (orderIds.length === 0) {
      return [];
    }

    const rawOrders = await this.redis.mget(...orderIds.map(orderKey));

    return rawOrders
      .filter((raw): raw is string => raw !== null)
      .map((raw) => JSON.parse(raw) as KitchenOrderRecord);
  }

  async updateStatus(
    orderId: string,
    status: 'pending' | 'preparing' | 'ready',
  ): Promise<KitchenOrderRecord> {
    const raw = await this.redis.get(orderKey(orderId));
    if (!raw) {
      throw new NotFoundException(
        `Order ${orderId} not found in kitchen queue`,
      );
    }

    const order = JSON.parse(raw) as KitchenOrderRecord;
    order.status = status;
    order.updatedAt = new Date().toISOString();

    await this.redis.set(orderKey(orderId), JSON.stringify(order));

    return order;
  }

  async removeFromQueue(orderId: string): Promise<void> {
    await this.redis.lrem(QUEUE_KEY, 0, orderId);
    await this.redis.del(orderKey(orderId));
  }

  async clearFinished(): Promise<number> {
    const orderIds = await this.redis.lrange(QUEUE_KEY, 0, -1);
    if (orderIds.length === 0) {
      return 0;
    }

    const rawOrders = await this.redis.mget(...orderIds.map(orderKey));

    let cleared = 0;
    for (let i = 0; i < orderIds.length; i++) {
      const raw = rawOrders[i];
      if (!raw) continue;

      const order = JSON.parse(raw) as KitchenOrderRecord;
      if (order.status === 'ready') {
        await this.removeFromQueue(orderIds[i]);
        cleared += 1;
      }
    }

    return cleared;
  }
}
