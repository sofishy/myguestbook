import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');
}

// For Vercel serverless
let cachedApp: any;

export default async (req: any, res: any) => {
  if (!cachedApp) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(express())
    );
    app.enableCors();
    app.setGlobalPrefix('api');
    await app.init();
    cachedApp = app.getHttpAdapter().getInstance();
  }
  return cachedApp(req, res);
};

if (process.env.NODE_ENV !== 'production') {
  bootstrap();
}