import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // --- 1. Create the Parent Order ---
  async createOrder(data: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    status: string;
  }) {
    const { data: order, error } = await this.supabase
      .from('orders')
      .insert({
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone,
        status: data.status,
      })
      .select()
      .single(); // .single() ensures we return an object, not an array of objects

    if (error) {
      this.logger.error(`Supabase createOrder Error: ${error.message}`);
      throw new InternalServerErrorException(
        'Failed to create order record in database.',
      );
    }

    return order;
  }

  // --- 2. Upload File to Storage ---
  async uploadStorageFile(
    bucket: string,
    path: string,
    fileBuffer: Buffer,
    mimetype: string,
  ): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        contentType: mimetype,
        upsert: true, // Overwrite if a file with the same name exists
      });

    if (error) {
      this.logger.error(`Supabase uploadStorageFile Error: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to upload artwork to bucket: ${bucket}`,
      );
    }

    // Retrieve and return the public URL so we can save it to the order_items table
    const { data: publicUrlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  }

  // --- 3. Insert Line Items ---
  async insertOrderItems(items: any[]) {
    // Supabase allows bulk inserts by passing an array of objects
    const { data, error } = await this.supabase
      .from('order_items')
      .insert(items)
      .select();

    if (error) {
      this.logger.error(`Supabase insertOrderItems Error: ${error.message}`);
      throw new InternalServerErrorException(
        'Failed to save order line items to database.',
      );
    }
    return data;
  }

  // --- Update Order Status ---
  async updateOrderStatus(orderId: string, status: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .update({ status: status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      this.logger.error(`Supabase updateOrderStatus Error: ${error.message}`);
      // Throw a standard NestJS error so the controller can catch it
      throw new Error('Failed to update order status in the database.');
    }

    return data;
  }
}
