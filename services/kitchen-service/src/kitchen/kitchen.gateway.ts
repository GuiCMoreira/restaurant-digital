import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { KitchenService } from './kitchen.service';

@WebSocketGateway({ namespace: 'kitchen', cors: true })
export class KitchenGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly kitchenService: KitchenService) {}

  async emitQueueUpdate(): Promise<void> {
    const queue = await this.kitchenService.getQueue();
    this.server.emit('queue:updated', queue);
  }
}
