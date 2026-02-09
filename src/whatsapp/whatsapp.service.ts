// whatsapp.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class WhatsappService {
  private client: Twilio;

  constructor(private configService: ConfigService) {
    this.client = new Twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN'),
    );
  }

  async sendNotification(to: string, message: string, mediaUrl?: string) {
    const logger = new Logger();
    logger.debug(`This application is on whatsapp service`);
    try {
      return await this.client.messages.create({
        from: `whatsapp:${this.configService.get('TWILIO_PHONE_NUMBER')}`,
        to: `whatsapp:${to}`,
        body: message,
        mediaUrl: mediaUrl ? [mediaUrl] : undefined, // Twilio handles the image link automatically
      });
    } catch (e) {
      logger.debug(`This application is on whatsapp service error,${e}`);
      throw e;
    }
  }
}
