import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class TokenBlacklistService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL, {
      tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
    });
  }

  async blacklistToken(jti: string, exp: number): Promise<void> {
    const ttl = exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await this.redis.setex(`blacklist:${jti}`, ttl, '1');
    }
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const exists = await this.redis.exists(`blacklist:${jti}`);
    return exists === 1;
  }
}