import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service'; // Import Prisma
import * as fs from 'fs';
import * as path from 'path';

@Controller('contact')
export class ContactController {
  constructor(
    private readonly mailService: MailService,
    private readonly prisma: PrismaService, // Inject Prisma
  ) {}

  @Post('send-orde')
  @UseInterceptors(FileInterceptor('image')) // 'image' must match the key in your Frontend FormData
  async uploadFile(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // debugger;
    try {
      // debugger;
      await this.mailService.sendPrintOrder(body, file);
      return { message: 'Order sent successfully!' };
    } catch (error) {
      return { message: 'Failed to send order', error: error.message };
    }
  }

  @Post('send-order')
  @UseInterceptors(FileInterceptor('image'))
  async handleOrder(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let savedImagePath = null;

    // 1. Save the file locally (if it exists)
    if (file) {
      const uploadDir = './uploads';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }

      // Create a unique filename: "timestamp-originalName"
      const uniqueFilename = `${Date.now()}-${file.originalname}`;
      savedImagePath = path.join(uploadDir, uniqueFilename);

      // Write file to disk
      fs.writeFileSync(savedImagePath, file.buffer);
    }

    // 2. Save Record to Database (SQLite)
    // We convert string "true"/"false" from FormData into actual booleans if needed
    const newEstimate = await this.prisma.estimate.create({
      data: {
        customerName: body.customerName,
        email: body.email,
        phone: body.phone,
        serviceType: body.serviceType,
        hasImage: body.hasImage === 'true', // FormData sends booleans as strings
        width: body.width,
        height: body.height,
        unit: body.unit,
        dimensions: body.dimensions,
        quantity: body.quantity,
        paperStock: body.paperStock,
        finish: body.finish,
        notes: body.notes,
        imagePath: savedImagePath, // Store the path string
      },
    });

    // 3. Send Email (Your existing logic)
    // We can now include the Order ID in the email subject!
    try {
      await this.mailService.sendPrintOrder(body, file);
      return {
        message: 'Order saved and email sent!',
        orderId: newEstimate.id,
      };
    } catch (error) {
      // Even if email fails, we have the record in DB
      return {
        message: 'Order saved to database, but email failed.',
        orderId: newEstimate.id,
        error: error.message,
      };
    }
  }
}
