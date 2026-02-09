import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePrintJobDto } from './dto/create-print-jobs.dto';
import { MailService } from 'src/mail/mail.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';

@Injectable()
export class PrintJobsService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private mailService: MailService,
    private whatsappService: WhatsappService,
  ) {}

  async create(
    createPrintJobDto: CreatePrintJobDto,
    file: Express.Multer.File,
  ) {
    const logger = new Logger();
    logger.debug(`This application is on service`);
    const supabase = this.supabaseService.getClient();

    // 1. Upload Image to Supabase Storage
    // We create a unique path: "uploads/timestamp-filename"
    const filePath = `uploads/${Date.now()}-${file.originalname}`;
    logger.debug(`This application is on service filepath:${filePath}`);
    logger.debug(`This application is on service file:${file}`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('print-uploads') // Make sure this bucket exists in Supabase
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      logger.debug(`Upload 1 failed: ${uploadError.message}`);
      throw new InternalServerErrorException(
        `Upload failed: ${uploadError.message}`,
      );
    }

    // 2. Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from('print-uploads')
      .getPublicUrl(filePath);

    // 3. Insert Data into Database
    const { data: insertData, error: insertError } = await supabase
      .from('print_estimates')
      .insert({
        customer_email: createPrintJobDto.customerEmail,
        width: Number(createPrintJobDto.width), // Ensure numbers are numbers
        height: Number(createPrintJobDto.height),
        material: createPrintJobDto.material,
        image_url: publicUrlData.publicUrl,
      })
      .select()
      .single();

    if (insertError) {
      logger.debug(`Database insert failed: ${insertError.message}`);
      throw new InternalServerErrorException(
        `Database insert failed: ${insertError.message}`,
      );
    }
    //aqi mail y whatsapp
    try {
      await Promise.all([
        this.mailService.sendEstimateEmail(
          'giancarlosanchez.dev@icloud.com',
          createPrintJobDto.customerEmail,
          publicUrlData.publicUrl,
        ),
        this.whatsappService.sendNotification(
          '+14053657708',
          `New estimate ready for ${createPrintJobDto.customerEmail}! View email`,
          '', // This sends the actual image preview in WhatsApp
        ),
      ]);
    } catch (e) {}

    return { message: 'Estimate created successfully', data: insertData };
  }
}
