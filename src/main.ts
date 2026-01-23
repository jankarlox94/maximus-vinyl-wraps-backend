import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { urlencoded, json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:5173', // Your local Vite/React frontend
      'http://localhost:3000',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  const server = app.getHttpAdapter();
  const router = server.getInstance();

  // This prints all available routes to your terminal
  router._router.stack.forEach((layer) => {
    if (layer.route) {
      console.log('routes: ', layer.route.path);
    }
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
