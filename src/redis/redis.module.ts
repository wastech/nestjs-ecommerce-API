// redis-cache.module.ts

import { Module } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service'; // Import RedisCacheService
// Other imports and providers...

@Module({
  providers: [RedisCacheService], // Provide RedisCacheService
  exports: [RedisCacheService], // Export RedisCacheService to be used in other modules
})
export class RedisCacheModule {}
