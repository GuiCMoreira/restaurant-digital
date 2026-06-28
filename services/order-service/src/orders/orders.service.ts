import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { CreateOrderDto } from './dto/create-order.dto';

export interface OrderItemRecord {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface OrderRecord {
  id: string;
  table_number: number;
  items: OrderItemRecord[];
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// Requer a seguinte tabela no Supabase:
//
// CREATE TABLE orders (
//   id UUID PRIMARY KEY,
//   table_number INTEGER NOT NULL,
//   items JSONB NOT NULL,
//   total_amount DECIMAL(10,2) NOT NULL,
//   status TEXT NOT NULL DEFAULT 'pending',
//   created_at TIMESTAMPTZ DEFAULT NOW(),
//   updated_at TIMESTAMPTZ DEFAULT NOW()
// );
@Injectable()
export class OrdersService {
  private readonly supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL') ?? '',
      this.configService.get<string>('SUPABASE_KEY') ?? '',
    );
  }

  async createOrder(dto: CreateOrderDto): Promise<OrderRecord> {
    const orderId = randomUUID();
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const { data, error } = await this.supabase
      .from('orders')
      .insert({
        id: orderId,
        table_number: dto.tableNumber,
        items: dto.items,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }

    return data as OrderRecord;
  }

  async findActiveByTable(tableNumber: number): Promise<OrderRecord[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*')
      .eq('table_number', tableNumber)
      .neq('status', 'closed');

    if (error) {
      throw new Error(
        `Failed to fetch orders for table ${tableNumber}: ${error.message}`,
      );
    }

    return data as OrderRecord[];
  }

  async updateStatus(orderId: string, status: string): Promise<OrderRecord> {
    const { data, error } = await this.supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update order ${orderId}: ${error.message}`);
    }

    return data as OrderRecord;
  }
}
