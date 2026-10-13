import Redis from 'ioredis';
import { env } from '../config/env';

class CacheService {
  private client: Redis | null = null;
  private isConnected = false;

  constructor() {
    try {
      this.client = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          if (times > 3) {
            return null; // stop retrying
          }
          return Math.min(times * 200, 1000);
        },
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        console.log('⚡ Redis Connected');
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        console.warn('⚠️ Redis connection warning:', err.message);
      });
    } catch (err) {
      console.warn('⚠️ Failed to initialize Redis client:', err);
      this.client = null;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.isConnected) return null;
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err) {
      console.warn('⚠️ Redis GET error:', err);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
    if (!this.client || !this.isConnected) return;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      console.warn('⚠️ Redis SET error:', err);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client || !this.isConnected) return;
    try {
      await this.client.del(key);
    } catch (err) {
      console.warn('⚠️ Redis DEL error:', err);
    }
  }

  async flushPattern(pattern: string): Promise<void> {
    if (!this.client || !this.isConnected) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (err) {
      console.warn('⚠️ Redis flush pattern error:', err);
    }
  }
}

export const cache = new CacheService();
