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
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
const config_1 = require("@nestjs/config");
const brevo_1 = require("@getbrevo/brevo");
let MailService = MailService_1 = class MailService {
    constructor(mailerService, config) {
        this.mailerService = mailerService;
        this.config = config;
        this.logger = new common_1.Logger(MailService_1.name);
        this.client = new brevo_1.BrevoClient({
            apiKey: process.env.BREVO_API_KEY || '',
        });
    }
    async sendEstimateEmail(to, customer_email, imageUrl) {
        this.logger.debug(`This application is on mail service try block (Estimate)`);
        try {
            await this.mailerService.sendMail({
                to,
                subject: 'New Design Estimate Created',
                html: `
        <h3>Hello ${customer_email},</h3>
        <p>Your new wallpaper design estimate is ready.</p>
        <p><a href="${imageUrl}">Click here to view the design image</a></p>
      `,
            });
            this.logger.debug(`This application is on mail service end of try block`);
        }
        catch (e) {
            this.logger.error(`This application is on mail service error, ${e}`);
        }
    }
    async sendQuoteRequestInternal(payload, processedItems) {
        this.logger.debug(`Sending internal quote request email for: ${payload.customerName}, Brevo SMTP Host: ${this.config.get('SMTP_HOST')}`);
        this.logger.debug(`Brevo SMTP Host: ${this.config.get('SMTP_HOST')}`);
        const itemsHtml = processedItems
            .map((item, index) => `
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8fafc;">
          <h4 style="margin-top: 0; color: #0f172a;">Item #${index + 1}: ${item.product_name}</h4>
          <ul style="list-style-type: none; padding-left: 0; color: #334155;">
            <li><strong>Size:</strong> ${item.size}</li>
            <li><strong>Quantity:</strong> ${item.quantity}</li>
            <li><strong>Material:</strong> ${item.material}</li>
            <li><strong>Est. Price:</strong> $${item.estimated_price}</li>
            <li><strong>Customer Notes:</strong> ${item.customer_notes || '<em>None provided</em>'}</li>
          </ul>
          ${item.artwork_url
            ? `<a href="${item.artwork_url}" style="display: inline-block; margin-top: 10px; padding: 8px 12px; background-color: #f97316; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">📥 View / Download Artwork</a>`
            : `<p style="color: #64748b; font-style: italic;">No artwork file attached.</p>`}
        </div>
      `)
            .join('');
        const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2 style="color: #f97316; border-bottom: 2px solid #f97316; padding-bottom: 10px;">New Quote Request - Maximus Vinyl Wrap</h2>
        
        <div style="margin-top: 20px; margin-bottom: 30px;">
          <h3 style="margin-bottom: 10px; color: #0f172a;">Customer Details</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${payload.customerName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${payload.customerEmail}">${payload.customerEmail}</a></p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${payload.customerPhone || '<em>Not provided</em>'}</p>
        </div>

        <h3 style="margin-bottom: 15px; color: #0f172a;">Requested Items</h3>
        ${itemsHtml}
      </div>
    `;
        try {
            await this.client.transactionalEmails.sendTransacEmail({
                subject: `🚨 New Quote Request from ${payload.customerName}, Customer Email: ${payload.customerEmail}`,
                sender: {
                    name: 'Maximus System',
                    email: 'giancarlosanchez.dev@icloud.com',
                },
                to: [{ email: `giancarlosanchez.dev@icloud.com`, name: 'Admin' }],
                htmlContent: emailHtml,
            });
            this.logger.debug(`Internal quote email successfully sent.`);
        }
        catch (e) {
            this.logger.error(`Failed to send internal quote email: ${e.message}`);
        }
    }
    async sendQuoteConfirmationToCustomer(payload, processedItems) {
        this.logger.debug(`Sending customer confirmation email to: ${payload.customerEmail}`);
        const itemsHtml = processedItems
            .map((item) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 0; color: #1e293b; font-weight: bold;">${item.product_name}</td>
          <td style="padding: 12px 0; color: #64748b; text-align: center;">x${item.quantity}</td>
          <td style="padding: 12px 0; color: #64748b; text-align: right;">${item.size}</td>
        </tr>
      `)
            .join('');
        const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        
        <div style="background-color: #0f172a; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">Maximus<span style="color: #f97316;">VINYL</span></h1>
        </div>

        <div style="padding: 32px 24px;">
          <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">We got your request, ${payload.customerName}!</h2>
          <p style="line-height: 1.6; color: #334155;">
            Thank you for reaching out to us. Our print specialists have received your project details and any artwork you attached. 
          </p>
          <p style="line-height: 1.6; color: #334155; margin-bottom: 24px;">
            We are currently reviewing your files to ensure the highest print quality. <strong>We will email you an official quote and digital proof shortly.</strong>
          </p>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <h3 style="margin-top: 0; color: #0f172a; font-size: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Project Summary</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <p style="line-height: 1.6; color: #334155;">
            If you have any immediate questions or need to make a change, simply reply to this email!
          </p>
        </div>

        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
          <p style="margin: 0;">Maximus Vinyl Wrap & Print</p>
          <p style="margin: 4px 0 0 0;">Oklahoma City, OK</p>
        </div>

      </div>
    `;
        try {
            await this.client.transactionalEmails.sendTransacEmail({
                subject: `Your Print Quote Request is Under Review - Maximus Vinyl`,
                sender: {
                    name: 'Maximus System',
                    email: 'joflorez@utp.edu.co',
                },
                to: [{ email: payload.customerEmail, name: 'Admin' }],
                htmlContent: emailHtml,
            });
            this.logger.debug(`Customer confirmation email successfully sent.`);
        }
        catch (e) {
            this.logger.error(`Failed to send customer confirmation email: ${e.message} Brevo SMTP Host: ${this.config.get('SMTP_HOST')}`);
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService,
        config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map