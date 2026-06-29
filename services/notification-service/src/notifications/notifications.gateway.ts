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
    @MessageBody() payload: { tableNumber: number },
    @ConnectedSocket() client: Socket,
  ): void {
    const room = `table:${payload.tableNumber}`;
    client.join(room);
    console.log('[Gateway] cliente entrou na room:', room);
  }

  @SubscribeMessage('join:kitchen')
  handleJoinKitchen(@ConnectedSocket() client: Socket): void {
    client.join('kitchen');
  }

  @SubscribeMessage('join:waiter')
  handleJoinWaiter(@ConnectedSocket() client: Socket): void {
    client.join('waiter');
  }

  @SubscribeMessage('request:bill')
  handleRequestBill(@MessageBody() payload: { tableNumber: number }): void {
    this.notifyWaiter('bill:requested', {
      tableNumber: payload.tableNumber,
      requestedAt: new Date().toISOString(),
    });
    console.log('[Gateway] bill:requested para mesa:', payload.tableNumber);
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

  broadcastSaleClosed(tableNumber: number): void {
    this.server.emit('sale:closed:broadcast', { tableNumber });
  }
}
