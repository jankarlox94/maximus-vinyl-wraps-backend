import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MailService } from '../mail/mail.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly mailService: MailService) {}

  @Post('send-order')
  @UseInterceptors(FileInterceptor('image')) // 'image' must match the key in your Frontend FormData
  async uploadFile(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    debugger;
    try {
      debugger;
      await this.mailService.sendPrintOrder(body, file);
      return { message: 'Order sent successfully!' };
    } catch (error) {
      return { message: 'Failed to send order', error: error.message };
    }
  }
}
