// mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEstimateEmail(
    to: string,
    customer_email: string,
    imageUrl: string,
  ) {
    const logger = new Logger();
    logger.debug(`This application is on mail service`);
    try {
      logger.debug(`This application is on mail service try block`);
      await this.mailerService.sendMail({
        to,
        subject: 'New Design Estimate Created',
        html: `
        <h3>Hello ${customer_email},</h3>
        <p>Your new wallpaper design estimate is ready.</p>
        <p><a href="${imageUrl}">Click here to view the design image</a></p>
      `,
      });
      logger.debug(`This application is on mail service end of try block`);
    } catch (e) {
      logger.debug(`This application is on mail service error,${e}`);
    }
  }
}
