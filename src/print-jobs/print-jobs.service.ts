import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { MailService } from 'src/mail/mail.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';

@Injectable()
export class PrintJobsService {
  private readonly logger = new Logger(PrintJobsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private mailService: MailService,
    private whatsappService: WhatsappService,
  ) {}

  // Notice we now accept an Array of files
  async create(payload: any, files: Array<Express.Multer.File>) {
    this.logger.debug(
      `Processing new quote request for: ${payload.customerName}`,
    );

    try {
      // 1. Create the parent Order/Quote record in the Database first
      // This gives you an ID to tie the line items to.
      const orderRecord = await this.supabaseService.createOrder({
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        customerPhone: payload.customerPhone,
        status: 'pending_quote',
      });

      // 2. Loop through the cart items and map/upload files concurrently
      // Using Promise.all speeds this up significantly if there are multiple files
      const processedItems = await Promise.all(
        payload.items.map(async (item) => {
          // Look for the specific file that belongs to this cart item
          const expectedFieldName = `file_${item.cartItemId}`;
          const matchedFile = files?.find(
            (f) => f.fieldname === expectedFieldName,
          );

          let uploadedFileUrl = null;

          // 3. Upload to Supabase Storage if a file was attached to this item
          if (matchedFile) {
            this.logger.debug(
              `Uploading artwork for item: ${item.productName}`,
            );

            // Assuming your SupabaseService has a method to handle the buffer upload
            // It's good practice to prefix the filename with the order ID or timestamp
            const uniqueFilename = `${orderRecord.id}/${Date.now()}-${matchedFile.originalname}`;

            uploadedFileUrl = await this.supabaseService.uploadStorageFile(
              'artwork_bucket', // Replace with your actual Supabase bucket name
              uniqueFilename,
              matchedFile.buffer,
              matchedFile.mimetype,
            );
          }

          // Return the fully assembled line item object ready for the database
          return {
            order_id: orderRecord.id,
            product_id: item.productId,
            product_name: item.productName,
            size: item.size,
            quantity: item.quantity,
            material: item.material,
            customer_notes: item.notes,
            artwork_url: uploadedFileUrl, // Now securely linked!
            estimated_price: item.price,
          };
        }),
      );

      // 4. Save the fully compiled line items to the Supabase Database
      await this.supabaseService.insertOrderItems(processedItems);

      // 5. Trigger Notifications for Maximus Vinyl Wrap team and the customer
      this.logger.debug(
        'Order saved. Triggering Mail and WhatsApp notifications...',
      );

      // Fire these off asynchronously so the user doesn't have to wait for the emails to finish sending
      this.mailService
        .sendQuoteRequestInternal(payload, processedItems)
        .catch((e) => this.logger.error(e));
      this.mailService
        .sendQuoteConfirmationToCustomer(payload, processedItems)
        .catch((e) => this.logger.error(e));
      this.whatsappService
        .notifyAdminNewQuote(
          orderRecord.id,
          payload.customerName,
          processedItems,
        )
        .catch((e) => this.logger.error(e));

      return {
        message: 'Order and files processed successfully',
        data: { orderId: orderRecord.id },
      };
    } catch (error) {
      this.logger.error(
        `Failed to process print job: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'An error occurred while saving the project details.',
      );
    }
  }
}

// import {
//   Injectable,
//   InternalServerErrorException,
//   Logger,
// } from '@nestjs/common';
// import { SupabaseService } from '../supabase/supabase.service';
// import { CreatePrintJobDto } from './dto/create-print-jobs.dto';
// import { MailService } from 'src/mail/mail.service';
// import { WhatsappService } from 'src/whatsapp/whatsapp.service';

// @Injectable()
// export class PrintJobsService {
//   constructor(
//     private readonly supabaseService: SupabaseService,
//     private mailService: MailService,
//     private whatsappService: WhatsappService,
//   ) {}

//   async create(
//     createPrintJobDto: CreatePrintJobDto,
//     file: Express.Multer.File,
//   ) {
//     const logger = new Logger();
//     logger.debug(`This application is on service`);
//     const supabase = this.supabaseService.getClient();

//     // 1. Upload Image to Supabase Storage
//     // We create a unique path: "uploads/timestamp-filename"
//     const filePath = `uploads/${Date.now()}-${file.originalname}`;
//     logger.debug(`This application is on service filepath:${filePath}`);
//     logger.debug(`This application is on service file:${file}`);
//     const { data: uploadData, error: uploadError } = await supabase.storage
//       .from('print-uploads') // Make sure this bucket exists in Supabase
//       .upload(filePath, file.buffer, {
//         contentType: file.mimetype,
//       });

//     if (uploadError) {
//       logger.debug(`Upload 1 failed: ${uploadError.message}`);
//       throw new InternalServerErrorException(
//         `Upload failed: ${uploadError.message}`,
//       );
//     }

//     // 2. Get Public URL
//     const { data: publicUrlData } = supabase.storage
//       .from('print-uploads')
//       .getPublicUrl(filePath);

//     // 3. Insert Data into Database
//     const { data: insertData, error: insertError } = await supabase
//       .from('print_estimates')
//       .insert({
//         customer_email: createPrintJobDto.customerEmail,
//         width: Number(createPrintJobDto.width), // Ensure numbers are numbers
//         height: Number(createPrintJobDto.height),
//         material: createPrintJobDto.material,
//         image_url: publicUrlData.publicUrl,
//       })
//       .select()
//       .single();

//     if (insertError) {
//       logger.debug(`Database insert failed: ${insertError.message}`);
//       throw new InternalServerErrorException(
//         `Database insert failed: ${insertError.message}`,
//       );
//     }
//     //aqi mail y whatsapp
//     try {
//       await Promise.all([
//         this.mailService.sendEstimateEmail(
//           'giancarlosanchez.dev@icloud.com',
//           createPrintJobDto.customerEmail,
//           publicUrlData.publicUrl,
//         ),
//         this.whatsappService.sendNotification(
//           '+14053657708',
//           `New estimate ready for ${createPrintJobDto.customerEmail}! View email`,
//           '', // This sends the actual image preview in WhatsApp
//         ),
//       ]);
//     } catch (e) {}

//     return { message: 'Estimate created successfully', data: insertData };
//   }
// }
