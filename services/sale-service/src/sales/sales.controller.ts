import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { SalesPublisher } from './sales.publisher';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly salesPublisher: SalesPublisher,
  ) {}

  @Get('table/:tableNumber')
  async getSaleByTable(
    @Param('tableNumber', ParseIntPipe) tableNumber: number,
  ) {
    return this.salesService.getSaleByTable(tableNumber);
  }

  @Get()
  async getAllOpenSales() {
    return this.salesService.getAllOpenSales();
  }

  @Post('table/:tableNumber/close')
  async closeSale(@Param('tableNumber', ParseIntPipe) tableNumber: number) {
    const sale = await this.salesService.closeSale(tableNumber);
    await this.salesPublisher.publishSaleClosed(sale);

    return sale;
  }
}
