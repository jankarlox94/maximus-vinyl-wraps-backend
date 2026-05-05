import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  Logger,
  BadRequestException,
  Get,
  InternalServerErrorException,
  Patch,
  Param,
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
        isCustomDesign: body.isCustomDesign,
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

  @Get('admin/dashboard')
  // In a real production app, you would add a @UseGuards(AuthGuard, RolesGuard) here
  async getAdminDashboard() {
    this.logger.debug('Admin dashboard data requested.');
    try {
      return await this.printJobsService.findAllOrders();
    } catch (e) {
      this.logger.error(`Failed to fetch dashboard data: ${e.message}`);
      throw new InternalServerErrorException('Could not retrieve orders.');
    }
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') orderId: string,
    @Body('status') status: string,
  ) {
    this.logger.debug(
      `Received request to update order ${orderId} to status: ${status}`,
    );

    // Basic validation to ensure a status was actually sent
    if (!status) {
      throw new BadRequestException('A new status must be provided.');
    }

    // Pass it down to the service
    return await this.printJobsService.updateStatus(orderId, status);
  }

  // orders.controller.ts
  @Patch(':id/payment')
  async updatePayment(
    @Param('id') id: string,
    @Body('is_paid') is_paid: boolean,
    @Body('pay_comments') pay_comments: string,
  ) {
    return this.printJobsService.updatePaymentStatus(id, is_paid, pay_comments);
  }
}
