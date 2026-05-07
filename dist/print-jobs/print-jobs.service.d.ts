import { SupabaseService } from '../supabase/supabase.service';
import { MailService } from 'src/mail/mail.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
export declare class PrintJobsService {
    private readonly supabaseService;
    private mailService;
    private whatsappService;
    private readonly logger;
    constructor(supabaseService: SupabaseService, mailService: MailService, whatsappService: WhatsappService);
    create(payload: any, files: Array<Express.Multer.File>): Promise<{
        message: string;
        data: {
            orderId: any;
        };
    }>;
    findByOrderNumber(orderNumber: string): Promise<any[]>;
    findAll(): Promise<any[]>;
    findAllOrders(): Promise<any[]>;
    updateStatus(orderId: string, status: string): Promise<{
        message: string;
        data: any;
    }>;
    updatePaymentStatus(orderId: string, isPaid: boolean, payComments: string): Promise<{
        message: string;
        data: any;
    }>;
}
