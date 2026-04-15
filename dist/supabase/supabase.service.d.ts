import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class SupabaseService {
    private configService;
    private supabase;
    private readonly logger;
    constructor(configService: ConfigService);
    getClient(): SupabaseClient;
    createOrder(data: {
        customerName: string;
        customerEmail: string;
        customerPhone?: string;
        status: string;
    }): Promise<any>;
    uploadStorageFile(bucket: string, path: string, fileBuffer: Buffer, mimetype: string): Promise<string>;
    insertOrderItems(items: any[]): Promise<any[]>;
    updateOrderStatus(orderId: string, status: string): Promise<any>;
    updatePaymentStatus(id: string, is_paid: boolean, pay_comments: string): Promise<any>;
}
