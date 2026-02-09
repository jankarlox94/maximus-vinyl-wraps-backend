import { Module } from '@nestjs/common';
import { PrintJobsService } from './print-jobs.service';
import { PrintJobsController } from './print-jobs.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';
// import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    SupabaseModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('SMTP_HOST'),
          port: config.get<number>('SMTP_PORT'),
          secure: false, // true for 465, false for other ports
          auth: {
            user: config.get('SMTP_USER'),
            pass: config.get('SMTP_PASS'),
          },
        },
        defaults: {
          from: config.get('EMAIL_FROM'),
        },
        template: {
          dir: join(__dirname, 'templates'), // We will create this folder
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [PrintJobsController],
  providers: [PrintJobsService, MailService, WhatsappService],
  exports: [MailService, WhatsappService],
})
export class PrintJobsModule {}
