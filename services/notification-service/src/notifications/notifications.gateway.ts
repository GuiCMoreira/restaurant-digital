import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/', cors: true })
export class NotificationsGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('join:table')
  handleJoinTable(
    @MessageBody() data: { tableNumber: number },
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(`table:${data.tableNumber}`);
  }

  @SubscribeMessage('join:kitchen')
  handleJoinKitchen(@ConnectedSocket() client: Socket): void {
    client.join('kitchen');
  }

  @SubscribeMessage('join:waiter')
  handleJoinWaiter(@ConnectedSocket() client: Socket): void {
    client.join('waiter');
  }

  notifyTable(tableNumber: number, event: string, data: unknown): void {
    this.server.to(`table:${tableNumber}`).emit(event, data);
  }

  notifyKitchen(event: string, data: unknown): void {
    this.server.to('kitchen').emit(event, data);
  }

  notifyWaiter(event: string, data: unknown): void {
    this.server.to('waiter').emit(event, data);
  }
}
