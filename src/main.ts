import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { urlencoded, json } from 'express';
import { LogLevel, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'] as LogLevel[],
    snapshot: true,
  });
  const configService = app.get(ConfigService);
  app.enableCors({
    origin: [
      'http://localhost:5173', // Your local Vite/React frontend
      'http://localhost:3000',
      'http://[::1]:3000',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.use(json({ limit: '50mb' }));
  // app.useBodyParser('json', { limit: '10mb' });
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  // const server = app.getHttpAdapter();
  // const router = server.getInstance();

  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);
  //  await app.listen(process.env.PORT ?? 3000);
  const logger = new Logger();
  logger.debug(
    `This application is runnning on: ${await app.getUrl()}`,
    'Bootstrap',
  );
  logger.log(port);
}
bootstrap();
