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

  // --- NEW: Notify Admin of New Quote ---
  async notifyAdminNewQuote(
    orderId: string,
    customerName: string,
    processedItems: any[],
  ) {
    const logger = new Logger();
    logger.debug(
      `Preparing admin WhatsApp notification for new quote: ${orderId}`,
    );

    // Fetch the admin's phone number from your .env file
    const adminPhone = this.configService.get<string>('ADMIN_WHATSAPP_NUMBER');

    if (!adminPhone) {
      logger.error(
        'ADMIN_WHATSAPP_NUMBER is missing in your environment variables.',
      );
      return; // Exit early so it doesn't crash
    }

    // 1. Header and Customer Info
    let messageBody = `🚨 *New Quote Request* 🚨\n\n`;
    messageBody += `*Customer:* ${customerName}\n`;
    messageBody += `*Order ID:* ${orderId}\n`;
    messageBody += `*Items in Cart:* ${processedItems.length}\n\n`;
    messageBody += `--- *Order Details* ---\n`;

    // 2. Loop through Cart Items
    processedItems.forEach((item, index) => {
      const itemDetails =
        `📦 *Item ${index + 1}:* ${item.product_name}\n` +
        `   - Size: ${item.size}\n` +
        `   - Qty: ${item.quantity}\n` +
        `   - Material: ${item.material}\n` +
        `   - Price: $${item.estimated_price}\n` +
        (item.customer_notes ? `   - Notes: ${item.customer_notes}\n` : '') +
        (item.artwork_url ? `   - [View Artwork](${item.artwork_url})\n` : '') +
        `\n`;

      // 3. Safety Check: Don't exceed ~1500 chars to leave room for the footer
      if (messageBody.length + itemDetails.length < 1500) {
        messageBody += itemDetails;
      } else if (!messageBody.includes('... (more items)')) {
        messageBody += `⚠️ *Truncated:* More items are listed in the dashboard.\n`;
      }
    });

    messageBody += `\nGo to the admin dashboard to review the full project details.`;

    try {
      // Reuse your existing method.
      // Note: Do not add 'whatsapp:' to adminPhone here, because your sendNotification method already does it!

      await this.sendNotification(adminPhone, messageBody);
      logger.debug(
        `WhatsApp notification successfully sent to admin for order ${orderId}`,
      );
    } catch (e) {
      // We catch the error here so a failed WhatsApp message doesn't stop
      // the NestJS controller from returning a 200 Success to the React frontend.
      logger.debug(`Failed to send admin WhatsApp notification: ${e}`);
    }
  }
}
