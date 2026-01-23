import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get('EMAIL_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS'),
      },
    });
  }

  async sendPrintOrder(formData: any, file: Express.Multer.File) {
    const {
      customerName,
      email,
      phone,
      serviceType,
      quantity,
      paperStock,
      dimensions,
      finish,
      notes,
      image,
    } = formData;

    const mailOptions = {
      from: `"Maximus Vinyl Wraps" <${this.configService.get('MAIL_FROM')}>`,
      to: this.configService.get('MANAGER_EMAIL'),
      subject: `New Print Order: ${customerName}`,
      text: `
        NEW ORDER SUBMISSION
        --------------------------------
        CUSTOMER DETAILS
        Name:  ${customerName}
        Email: ${email}
        Phone: ${phone}

        ORDER SPECS
        Service Type: ${serviceType}
        Quantity:     ${quantity}
        Paper Stock:  ${paperStock}
        Dimensions:   ${dimensions}
        Finish:       ${finish}

        NOTES
        ${notes || 'None'}

        ATTACHMENT
        ${image ? 'Image file included with submission.' : 'No image uploaded.'}
        `,
      attachments: [
        {
          filename: file.originalname,
          content: file.buffer,
        },
      ],
    };

    return await this.transporter.sendMail(mailOptions);
  }
}
