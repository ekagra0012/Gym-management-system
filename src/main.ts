import * as crypto from 'crypto';
if (!globalThis.crypto) {
  Object.assign(globalThis, { crypto: { randomUUID: crypto.randomUUID } });
}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Global prefix
  app.setGlobalPrefix('api');

  // Security
  app.use(helmet());
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('WellVantage Gym Management API')
    .setDescription(
      'Backend API for WellVantage — a gym trainer management platform. Supports 5 core screens: Sign Up, Workout List, Add Workout Plan, Set Availability, and Book Client Slots.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'Register, login, and Google OAuth')
    .addTag('Workout Plans', 'Custom and prebuilt workout plan management')
    .addTag('Clients', 'Client records owned by a trainer (not independent users)')
    .addTag('Availability', 'Trainer calendar slot scheduling')
    .addTag('Bookings', 'Book clients into available trainer slots')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Gym Management API running on http://localhost:${port}/api`);
  logger.log(`📚 Swagger UI: http://localhost:${port}/api/docs`);
}
bootstrap();
