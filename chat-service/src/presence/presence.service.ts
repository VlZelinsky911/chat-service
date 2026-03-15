import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class PresenceService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly TTL_SECONDS = 86400; // 24 hours

  // Redis keys
  private readonly ONLINE_USERS_KEY = 'online:users';
  private readonly SOCKET_USER_KEY = 'socket:user';
  private readonly USER_SOCKETS_PREFIX = 'user:sockets:';

  constructor(private readonly configService: ConfigService) {
    const redisHost = this.configService.get<string>('redis.host') || 'localhost';
    const redisPort = this.configService.get<number>('redis.port') || 6379;
    const redisPassword = this.configService.get<string>('redis.password');

    this.redis = new Redis({
      host: redisHost,
      port: redisPort,
      ...(redisPassword && { password: redisPassword }),
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  /**
   * Mark user as online when they connect
   */
  async setUserOnline(userId: string, socketId: string): Promise<void> {
    const userSocketsKey = `${this.USER_SOCKETS_PREFIX}${userId}`;

    const pipeline = this.redis.pipeline();

    // Add user to online users set
    pipeline.sadd(this.ONLINE_USERS_KEY, userId);

    // Map socketId -> userId
    pipeline.hset(this.SOCKET_USER_KEY, socketId, userId);

    // Add socketId to user's sockets set
    pipeline.sadd(userSocketsKey, socketId);

    // Set TTL for user's sockets key
    pipeline.expire(userSocketsKey, this.TTL_SECONDS);

    await pipeline.exec();
  }

  /**
   * Mark user as offline when they disconnect
   */
  async setUserOffline(socketId: string): Promise<string | null> {
    // Get userId from socketId
    const userId = await this.redis.hget(this.SOCKET_USER_KEY, socketId);

    if (!userId) {
      return null;
    }

    const userSocketsKey = `${this.USER_SOCKETS_PREFIX}${userId}`;

    // Remove socketId from user's sockets set
    await this.redis.srem(userSocketsKey, socketId);

    // Remove socketId -> userId mapping
    await this.redis.hdel(this.SOCKET_USER_KEY, socketId);

    // Check if user has any remaining sockets
    const remainingSockets = await this.redis.scard(userSocketsKey);

    if (remainingSockets === 0) {
      // User has no more connections, remove from online users
      await this.redis.srem(this.ONLINE_USERS_KEY, userId);
      // Clean up empty set
      await this.redis.del(userSocketsKey);
    }

    return userId;
  }

  /**
   * Check if user is online
   */
  async isUserOnline(userId: string): Promise<boolean> {
    const result = await this.redis.sismember(this.ONLINE_USERS_KEY, userId);
    return result === 1;
  }

  /**
   * Get all online user IDs
   */
  async getOnlineUsers(): Promise<string[]> {
    return this.redis.smembers(this.ONLINE_USERS_KEY);
  }

  /**
   * Get all socket IDs for a user
   */
  async getUserSockets(userId: string): Promise<string[]> {
    const userSocketsKey = `${this.USER_SOCKETS_PREFIX}${userId}`;
    return this.redis.smembers(userSocketsKey);
  }

  /**
   * Get user ID by socket ID
   */
  async getUserBySocket(socketId: string): Promise<string | null> {
    return this.redis.hget(this.SOCKET_USER_KEY, socketId);
  }

  /**
   * Get online status for multiple users
   */
  async getMultipleUsersOnlineStatus(
    userIds: string[],
  ): Promise<Map<string, boolean>> {
    const result = new Map<string, boolean>();

    if (userIds.length === 0) {
      return result;
    }

    const pipeline = this.redis.pipeline();
    for (const userId of userIds) {
      pipeline.sismember(this.ONLINE_USERS_KEY, userId);
    }

    const responses = await pipeline.exec();

    if (responses) {
      userIds.forEach((userId, index) => {
        const [err, isOnline] = responses[index] || [null, 0];
        result.set(userId, !err && isOnline === 1);
      });
    }

    return result;
  }

  /**
   * Cleanup stale data (for maintenance)
   */
  async cleanup(): Promise<void> {
    // Get all socket mappings
    const socketMappings = await this.redis.hgetall(this.SOCKET_USER_KEY);

    for (const [socketId, userId] of Object.entries(socketMappings)) {
      const userSocketsKey = `${this.USER_SOCKETS_PREFIX}${userId}`;
      const exists = await this.redis.sismember(userSocketsKey, socketId);

      if (!exists) {
        // Orphaned socket mapping, clean it up
        await this.redis.hdel(this.SOCKET_USER_KEY, socketId);
      }
    }
  }
}
