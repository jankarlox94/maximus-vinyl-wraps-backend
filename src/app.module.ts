import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrintJobsModule } from './print-jobs/print-jobs.module';
import { PrintJobsController } from './print-jobs/print-jobs.controller';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { MailService } from './mail/mail.service';
import { WhatsappService } from './whatsapp/whatsapp.service';

@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    PrintJobsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrintJobsModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailService, WhatsappService],
})
export class AppModule {}
