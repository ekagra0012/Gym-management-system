import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Gym Management API running on http://localhost:${port}`);
}
bootstrap();
