import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { OrderConfirmedEvent, OrderItem } from '@restaurant/shared-types';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL ?? 'http://localhost:3001';
const ACTIVE_ORDER_STATUSES = ['pending', 'preparing'];

interface OrderStatusRecord {
  status: string;
}

export interface SaleRecord {
  id: string;
  table_number: number;
  status: 'open' | 'closed';
  total_amount: number;
  created_at: string;
  closed_at: string | null;
  bill_requested: boolean;
  bill_requested_at: string | null;
}

export interface SaleItemRecord {
  id: string;
  sale_id: string;
  order_id: string;
  items: OrderItem[];
  amount: number;
  created_at: string;
}

export interface SaleWithItems extends SaleRecord {
  items: SaleItemRecord[];
}

// Requer as seguintes tabelas no Supabase:
//
// CREATE TABLE sales (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   table_number INTEGER NOT NULL,
//   status TEXT NOT NULL DEFAULT 'open',
//   total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
//   created_at TIMESTAMPTZ DEFAULT NOW(),
//   closed_at TIMESTAMPTZ,
//   bill_requested BOOLEAN DEFAULT FALSE,
//   bill_requested_at TIMESTAMPTZ
// );
//
// ALTER TABLE sales
//   ADD COLUMN IF NOT EXISTS bill_requested BOOLEAN DEFAULT FALSE,
//   ADD COLUMN IF NOT EXISTS bill_requested_at TIMESTAMPTZ;
//
// CREATE TABLE sale_items (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   sale_id UUID NOT NULL REFERENCES sales(id),
//   order_id UUID NOT NULL,
//   items JSONB NOT NULL,
//   amount DECIMAL(10,2) NOT NULL,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
@Injectable()
export class SalesService {
  private readonly supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL') ?? '',
      this.configService.get<string>('SUPABASE_KEY') ?? '',
    );
  }

  async getOrCreateSale(tableNumber: number): Promise<SaleRecord> {
    const { data: existingSale, error: findError } = await this.supabase
      .from('sales')
      .select('*')
      .eq('table_number', tableNumber)
      .eq('status', 'open')
      .maybeSingle();

    if (findError) {
      throw new Error(
        `Failed to look up open sale for table ${tableNumber}: ${findError.message}`,
      );
    }

    if (existingSale) {
      return existingSale as SaleRecord;
    }

    const { data: newSale, error: insertError } = await this.supabase
      .from('sales')
      .insert({ table_number: tableNumber, status: 'open', total_amount: 0 })
      .select()
      .single();

    if (insertError) {
      throw new Error(
        `Failed to create sale for table ${tableNumber}: ${insertError.message}`,
      );
    }

    return newSale as SaleRecord;
  }

  async addOrderToSale(event: OrderConfirmedEvent): Promise<SaleRecord> {
    const sale = await this.getOrCreateSale(event.tableNumber);

    const amount = event.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const { error: insertError } = await this.supabase
      .from('sale_items')
      .insert({
        sale_id: sale.id,
        order_id: event.orderId,
        items: event.items,
        amount,
      });

    if (insertError) {
      throw new Error(
        `Failed to add order ${event.orderId} to sale ${sale.id}: ${insertError.message}`,
      );
    }

    const { data: updatedSale, error: updateError } = await this.supabase
      .from('sales')
      .update({ total_amount: sale.total_amount + amount })
      .eq('id', sale.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(
        `Failed to update total for sale ${sale.id}: ${updateError.message}`,
      );
    }

    return updatedSale as SaleRecord;
  }

  async getSaleByTable(tableNumber: number): Promise<SaleWithItems | null> {
    const { data: sale, error: findError } = await this.supabase
      .from('sales')
      .select('*')
      .eq('table_number', tableNumber)
      .eq('status', 'open')
      .maybeSingle();

    if (findError) {
      throw new Error(
        `Failed to fetch sale for table ${tableNumber}: ${findError.message}`,
      );
    }

    if (!sale) {
      return null;
    }

    return this.attachItems(sale as SaleRecord);
  }

  async closeSale(tableNumber: number): Promise<SaleWithItems> {
    const { data: openSale, error: findError } = await this.supabase
      .from('sales')
      .select('*')
      .eq('table_number', tableNumber)
      .eq('status', 'open')
      .maybeSingle();

    if (findError) {
      throw new Error(
        `Failed to look up open sale for table ${tableNumber}: ${findError.message}`,
      );
    }

    if (!openSale) {
      throw new NotFoundException(`No open sale found for table ${tableNumber}`);
    }

    await this.ensureNoActiveKitchenOrders(tableNumber);

    const { data: saleItems, error: itemsError } = await this.supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', openSale.id);

    if (itemsError) {
      throw new Error(
        `Failed to fetch items for sale ${openSale.id}: ${itemsError.message}`,
      );
    }

    const { data: closedSale, error: updateError } = await this.supabase
      .from('sales')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', openSale.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(
        `Failed to close sale ${openSale.id}: ${updateError.message}`,
      );
    }

    return {
      ...(closedSale as SaleRecord),
      items: (saleItems ?? []) as SaleItemRecord[],
    };
  }

  async requestBill(tableNumber: number): Promise<SaleRecord> {
    const { data: openSale, error: findError } = await this.supabase
      .from('sales')
      .select('*')
      .eq('table_number', tableNumber)
      .eq('status', 'open')
      .maybeSingle();

    if (findError) {
      throw new Error(
        `Failed to find open sale for table ${tableNumber}: ${findError.message}`,
      );
    }

    if (!openSale) {
      throw new NotFoundException(`No open sale found for table ${tableNumber}`);
    }

    const { data: updatedSale, error: updateError } = await this.supabase
      .from('sales')
      .update({
        bill_requested: true,
        bill_requested_at: new Date().toISOString(),
      })
      .eq('id', openSale.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(
        `Failed to request bill for sale ${openSale.id}: ${updateError.message}`,
      );
    }

    return updatedSale as SaleRecord;
  }

  async getAllOpenSales(): Promise<SaleWithItems[]> {
    const { data: sales, error } = await this.supabase
      .from('sales')
      .select('*')
      .eq('status', 'open');

    if (error) {
      throw new Error(`Failed to fetch open sales: ${error.message}`);
    }

    return Promise.all(
      (sales as SaleRecord[]).map((sale) => this.attachItems(sale)),
    );
  }

  private async ensureNoActiveKitchenOrders(tableNumber: number): Promise<void> {
    const response = await fetch(
      `${ORDER_SERVICE_URL}/orders/table/${tableNumber}`,
    );

    if (!response.ok) {
      throw new Error(
        `Failed to check active orders for table ${tableNumber}: order-service respondeu ${response.status}`,
      );
    }

    const orders = (await response.json()) as OrderStatusRecord[];
    const hasActiveOrders = orders.some((order) =>
      ACTIVE_ORDER_STATUSES.includes(order.status),
    );

    if (hasActiveOrders) {
      throw new BadRequestException(
        'Existem pedidos em aberto na cozinha para esta mesa. Aguarde todos os pedidos serem finalizados.',
      );
    }
  }

  private async attachItems(sale: SaleRecord): Promise<SaleWithItems> {
    const { data: items, error } = await this.supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', sale.id);

    if (error) {
      throw new Error(
        `Failed to fetch items for sale ${sale.id}: ${error.message}`,
      );
    }

    return { ...sale, items: (items ?? []) as SaleItemRecord[] };
  }
}
