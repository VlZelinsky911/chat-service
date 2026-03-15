import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module.js';
import { RedisIoAdapter } from './common/adapters/redis-io.adapter.js';

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

  // Setup Redis WebSocket adapter for horizontal scaling
  const redisIoAdapter = new RedisIoAdapter(app, configService);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  // Enable graceful shutdown hooks (for Prisma, Redis cleanup)
  app.enableShutdownHooks();

  const port = configService.get<number>('app.port') || 5001;
  await app.listen(port);
  console.log(`🚀 Chat service is running on port ${port}`);
}
bootstrap();
