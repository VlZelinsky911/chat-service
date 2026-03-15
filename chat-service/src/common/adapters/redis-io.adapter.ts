import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { ServerOptions } from 'socket.io';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter> | undefined;

  constructor(
    app: INestApplicationContext,
    private readonly configService: ConfigService,
  ) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const redisHost = this.configService.get<string>('redis.host') || 'localhost';
    const redisPort = this.configService.get<number>('redis.port') || 6379;
    const redisPassword = this.configService.get<string>('redis.password');

    const redisOptions = {
      host: redisHost,
      port: redisPort,
      ...(redisPassword && { password: redisPassword }),
    };

    const pubClient = new Redis(redisOptions);
    const subClient = pubClient.duplicate();

    // Wait for both clients to connect
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        pubClient.on('connect', resolve);
        pubClient.on('error', reject);
      }),
      new Promise<void>((resolve, reject) => {
        subClient.on('connect', resolve);
        subClient.on('error', reject);
      }),
    ]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: this.configService.get<string>('cors.origin') || '*',
        credentials: true,
      },
    });

    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }

    return server;
  }
}
