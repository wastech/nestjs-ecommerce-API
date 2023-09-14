// redis-cache.service.ts

import { Injectable } from '@nestjs/common';
import Redis from 'ioredis'; // Import the default export

@Injectable()
export class RedisCacheService {
  private readonly redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: 'localhost', // Redis server host
      port: 6379, // Redis server port
      maxRetriesPerRequest: 3, // Set a reasonable value for maxRetriesPerRequest
      // Other configuration options
    });
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }
  

  async set(key: string, value: string, expiresIn: number): Promise<void> {
    await this.redisClient.set(key, value, 'EX', expiresIn);
  }
  async delete(key: string): Promise<number> {
    const client = this.redisClient; // Assuming this.redisClient is your ioredis instance
    return await client.del(key);
  }

  
}
