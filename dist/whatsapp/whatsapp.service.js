"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const twilio_1 = require("twilio");
let WhatsappService = class WhatsappService {
    constructor(configService) {
        this.configService = configService;
        this.client = new twilio_1.Twilio(this.configService.get('TWILIO_ACCOUNT_SID'), this.configService.get('TWILIO_AUTH_TOKEN'));
    }
    async sendNotification(to, message, mediaUrl) {
        const logger = new common_1.Logger();
        logger.debug(`This application is on whatsapp service`);
        try {
            return await this.client.messages.create({
                from: `whatsapp:${this.configService.get('TWILIO_PHONE_NUMBER')}`,
                to: `whatsapp:${to}`,
                body: message,
                mediaUrl: mediaUrl ? [mediaUrl] : undefined,
            });
        }
        catch (e) {
            logger.debug(`This application is on whatsapp service error,${e}`);
            throw e;
        }
    }
    async notifyAdminNewQuote(orderId, customerName, processedItems) {
        const logger = new common_1.Logger();
        logger.debug(`Preparing admin WhatsApp notification for new quote: ${orderId}`);
        const adminPhone = this.configService.get('ADMIN_WHATSAPP_NUMBER');
        if (!adminPhone) {
            logger.error('ADMIN_WHATSAPP_NUMBER is missing in your environment variables.');
            return;
        }
        let messageBody = `🚨 *New Quote Request* 🚨\n\n`;
        messageBody += `*Customer:* ${customerName}\n`;
        messageBody += `*Order ID:* ${orderId}\n`;
        messageBody += `*Items in Cart:* ${processedItems.length}\n\n`;
        messageBody += `--- *Order Details* ---\n`;
        processedItems.forEach((item, index) => {
            const itemDetails = `📦 *Item ${index + 1}:* ${item.product_name}\n` +
                `   - Size: ${item.size}\n` +
                `   - Qty: ${item.quantity}\n` +
                `   - Material: ${item.material}\n` +
                `   - Price: $${item.estimated_price}\n` +
                (item.customer_notes ? `   - Notes: ${item.customer_notes}\n` : '') +
                (item.artwork_url ? `   - [View Artwork](${item.artwork_url})\n` : '') +
                `\n`;
            if (messageBody.length + itemDetails.length < 1500) {
                messageBody += itemDetails;
            }
            else if (!messageBody.includes('... (more items)')) {
                messageBody += `⚠️ *Truncated:* More items are listed in the dashboard.\n`;
            }
        });
        messageBody += `\nGo to the admin dashboard to review the full project details.`;
        try {
            await this.sendNotification(adminPhone, messageBody);
            logger.debug(`WhatsApp notification successfully sent to admin for order ${orderId}`);
        }
        catch (e) {
            logger.debug(`Failed to send admin WhatsApp notification: ${e}`);
        }
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map