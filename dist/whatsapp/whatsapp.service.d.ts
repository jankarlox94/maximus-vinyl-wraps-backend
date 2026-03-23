import { ConfigService } from '@nestjs/config';
export declare class WhatsappService {
    private configService;
    private client;
    constructor(configService: ConfigService);
    sendNotification(to: string, message: string, mediaUrl?: string): Promise<import("twilio/lib/rest/api/v2010/account/message").MessageInstance>;
    notifyAdminNewQuote(orderId: string, customerName: string, processedItems: any[]): Promise<void>;
}
