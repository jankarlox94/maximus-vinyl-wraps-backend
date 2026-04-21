import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private readonly mailerService;
    config: ConfigService;
    private readonly logger;
    private client;
    private mailFrom;
    private manageEmail;
    constructor(mailerService: MailerService, config: ConfigService);
    sendEstimateEmail(to: string, customer_email: string, imageUrl: string): Promise<void>;
    sendQuoteRequestInternal(payload: any, processedItems: any[]): Promise<void>;
    sendQuoteConfirmationToCustomer(payload: any, processedItems: any[]): Promise<void>;
}
