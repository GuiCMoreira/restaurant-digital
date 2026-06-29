import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { KitchenGateway } from './kitchen.gateway';
import { KitchenPublisher } from './kitchen.publisher';
import { KitchenService } from './kitchen.service';

@Controller('kitchen')
export class KitchenController {
  constructor(
    private readonly kitchenService: KitchenService,
    private readonly kitchenPublisher: KitchenPublisher,
    private readonly kitchenGateway: KitchenGateway,
  ) {}

  @Get('queue')
  async getQueue() {
    return this.kitchenService.getQueue();
  }

  @Patch('orders/:orderId/status')
  async updateStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: 'preparing' | 'ready',
  ) {
    const order = await this.kitchenService.updateStatus(orderId, status);

    await this.kitchenPublisher.publishStatusUpdated(
      order.orderId,
      order.tableNumber,
      status,
    );
    await this.kitchenGateway.emitQueueUpdate();

    return order;
  }

  @Delete('queue/finished')
  async clearFinished() {
    const cleared = await this.kitchenService.clearFinished();
    await this.kitchenGateway.emitQueueUpdate();

    return { cleared };
  }
}
