import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { PrintJobsService } from './print-jobs.service';

@Controller('print-jobs')
export class PrintJobsController {
  private readonly logger = new Logger(PrintJobsController.name);

  // We inject the PrintJobsService here.
  // (The PrintJobsService is the one that has the SupabaseService injected into it!)
  constructor(private readonly printJobsService: PrintJobsService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async create(
    @Body() body: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    this.logger.debug(`Incoming print job request received.`);

    // 1. File Validation
    const MAX_SIZE = 8 * 1024 * 1024; // 8MB limit
    const ALLOWED_TYPES = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/pdf',
    ];

    if (files && files.length > 0) {
      for (const file of files) {
        if (file.size > MAX_SIZE) {
          this.logger.debug(`File ${file.originalname} exceeds the 8MB limit.`);
          throw new BadRequestException(
            `File ${file.originalname} exceeds the 8MB limit.`,
          );
        }
        if (!ALLOWED_TYPES.includes(file.mimetype)) {
          this.logger.debug(
            `File ${file.originalname} has an invalid type. Only PNG, JPEG,PJG and PDF are allowed.`,
          );
          throw new BadRequestException(
            `File ${file.originalname} has an invalid type. Only PNG, JPEG, JPG, and PDF are allowed.`,
          );
        }
      }
    }

    try {
      // 2. Parse the stringified React cartData back into an Array
      const cartItems = body.cartData ? JSON.parse(body.cartData) : [];

      // 3. Assemble the clean payload
      const printJobPayload = {
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        items: cartItems,
      };

      // 4. THIS IS WHERE IT CALLS THE SERVICE!
      // We pass the clean payload and the physical files to the PrintJobsService.
      // The PrintJobsService will then loop through these items and upload them via Supabase.
      return await this.printJobsService.create(printJobPayload, files);
    } catch (e) {
      this.logger.error(`error in catcher${e}`);
      this.logger.error(`Failed to parse order payload: ${e.message}`, e.stack);
      throw new BadRequestException('Invalid payload data or malformed JSON.');
    }
  }
}

// import {
//   Controller,
//   Post,
//   Body,
//   UseInterceptors,
//   UploadedFile,
//   ParseFilePipe,
//   MaxFileSizeValidator,
//   FileTypeValidator,
//   Logger,
// } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { PrintJobsService } from './print-jobs.service';
// import { CreatePrintJobDto } from './dto/create-print-jobs.dto';

// @Controller('print-jobs')
// export class PrintJobsController {
//   // logger: Logger;
//   constructor(private readonly printJobsService: PrintJobsService) {}

//   @Post()
//   @UseInterceptors(FileInterceptor('image')) // 'image' must match the key in your React FormData
//   async create(
//     @Body() createPrintJobDto: CreatePrintJobDto,

//     @UploadedFile(
//       new ParseFilePipe({
//         validators: [
//           new MaxFileSizeValidator({ maxSize: 8 * 1024 * 1024 }), // 8MB limit
//           new FileTypeValidator({ fileType: '.(png|jpeg|jpg|pdf)' }), // File types
//         ],
//       }),
//     )
//     file: Express.Multer.File,
//   ) {
//     const logger = new Logger();
//     logger.debug(`This application is on controller`);
//     // logger.log(port);
//     // this.logger.log('this log');
//     try {
//       //return this.mailSer
//       return this.printJobsService.create(createPrintJobDto, file);
//     } catch (e) {
//       logger.debug(`This application failed:${e}`);
//     }
//   }

//   // 1. 'createPrintJobDto' is changed to 'body: any' to handle the raw FormData
//     // 2. 'file' is changed to 'files: Array<Express.Multer.File>' to handle multiple uploads
//     create2(body: any, files: Array<Express.Multer.File>): Promise<{
//         message: string;
//         data: {
//             orderId: any;
//         };
//     }>;
// }
