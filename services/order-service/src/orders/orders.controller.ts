import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersPublisher } from './orders.publisher';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly ordersPublisher: OrdersPublisher,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.createOrder(createOrderDto);

    await this.ordersPublisher.publishOrderCreated(order);
    await this.ordersPublisher.publishOrderConfirmed(order);

    return order;
  }

  @Get('table/:tableNumber')
  async findByTable(@Param('tableNumber', ParseIntPipe) tableNumber: number) {
    return this.ordersService.findActiveByTable(tableNumber);
  }

  @Patch(':orderId/status')
  async updateStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: string,
  ) {
    return this.ordersService.updateStatus(orderId, status);
  }
}
