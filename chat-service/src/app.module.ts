import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import {
  appConfig,
  corsConfig,
  databaseConfig,
  redisConfig,
  jwtConfig,
  validate,
} from './config/index.js';
import { PrismaModule } from './prisma/index.js';
import { CommonModule } from './common/index.js';
import { PresenceModule } from './presence/index.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      load: [appConfig, corsConfig, databaseConfig, redisConfig, jwtConfig],
    }),
    PrismaModule,
    CommonModule,
    PresenceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
