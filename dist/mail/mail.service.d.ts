import { MailerService } from '@nestjs-modules/mailer';
export declare class MailService {
    private readonly mailerService;
    private readonly logger;
    constructor(mailerService: MailerService);
    sendEstimateEmail(to: string, customer_email: string, imageUrl: string): Promise<void>;
    sendQuoteRequestInternal(payload: any, processedItems: any[]): Promise<void>;
    sendQuoteConfirmationToCustomer(payload: any, processedItems: any[]): Promise<void>;
}
