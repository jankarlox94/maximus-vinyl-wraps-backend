import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrintJobsService } from './print-jobs.service';
import { CreatePrintJobDto } from './dto/create-print-jobs.dto';

@Controller('print-jobs')
export class PrintJobsController {
  // logger: Logger;
  constructor(private readonly printJobsService: PrintJobsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image')) // 'image' must match the key in your React FormData
  async create(
    @Body() createPrintJobDto: CreatePrintJobDto,

    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 8 * 1024 * 1024 }), // 8MB limit
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|pdf)' }), // File types
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const logger = new Logger();
    logger.debug(`This application is on controller`);
    // logger.log(port);
    // this.logger.log('this log');
    try {
      //return this.mailSer
      return this.printJobsService.create(createPrintJobDto, file);
    } catch (e) {
      logger.debug(`This application failed:${e}`);
    }
  }
}
