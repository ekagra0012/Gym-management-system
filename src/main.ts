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
    .setTitle('Gym Management API')
    .setDescription(
      'Comprehensive gym management platform supporting Members, Trainers, Subscriptions, Attendance, and Payments.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'Signup, login, and JWT token management')
    .addTag('Members', 'Member profile management')
    .addTag('Trainers', 'Trainer profiles and specializations')
    .addTag('Membership Plans', 'Management of billing plans and packages')
    .addTag('Subscriptions', 'Linkages between members and plans')
    .addTag('Attendance', 'Check-in and check-out tracking')
    .addTag('Payments', 'Transaction records and tracking')
    .addTag('Dashboard', 'Admin analytics and aggregated statistics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Gym Management API running on http://localhost:${port}/api`);
  logger.log(`📚 Swagger UI: http://localhost:${port}/api/docs`);
}
bootstrap();
