import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const corsOriginRaw = configService.get<string>('cors.origin') || '*';
  const corsOrigin =
    corsOriginRaw === '*'
      ? true
      : corsOriginRaw
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean);

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });
  app.useGlobalPipes(new ZodValidationPipe());

  await app.listen(configService.get<number>('app.port') || 5001);
}
bootstrap();
