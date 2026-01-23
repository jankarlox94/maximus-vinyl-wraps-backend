import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailModule } from './mail/mail.module';
import { ContactController } from './contact/contact.controller';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail/mail.service';

@Module({
  imports: [MailModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController, ContactController],
  providers: [AppService, MailService],
})
export class AppModule {}
